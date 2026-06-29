/**
 * 持仓基金管理
 *
 * 功能：
 * - 基金代码查询名称（东方财富 fundcode_search.js）
 * - 基金实时估值（东方财富 fundgz 接口）
 * - 持仓 CRUD（JSON 文件存储）
 *
 * 数据文件：backend/data/portfolio.json
 */

import { Router, Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";

const router = Router();
const DATA_DIR = path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");

// ---- 统一响应 ---- //

function success<T>(data: T) {
  return { code: 0, message: "success", data };
}

function fail(msg: string) {
  return { code: -1, message: msg, data: null };
}

// ---- 数据存储 ---- //

/** 确保数据目录和文件存在 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

/** 读取所有持仓记录 */
function readPortfolio(): any[] {
  ensureDataDir();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

/** 写入持仓记录 */
function writePortfolio(data: any[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** 生成自增 ID */
function nextId(list: any[]): number {
  return list.length > 0 ? Math.max(...list.map((i: any) => i.id)) + 1 : 1;
}

// ---- 基金搜索 ---- //

/** 基金代码 → 名称 映射表 */
let fundList: [string, string, string][] | null = null;
let fundMap: Map<string, { name: string; pinyin: string }> | null = null;

/** 从东方财富加载全量基金代码映射表 */
async function loadFundList() {
  if (fundList) return;
  const { data: raw } = await axios.get(
    "https://fund.eastmoney.com/js/fundcode_search.js",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  const match = raw.match(/var r = (\[.*?\]);/);
  if (!match) throw new Error("获取基金列表失败");
  fundList = JSON.parse(match[1]);
  fundMap = new Map();
  for (const [code, pinyin, name] of fundList!) {
    fundMap.set(code, { name, pinyin });
  }
}

// ---- 基金估值 ---- //

/** 获取指定基金代码的实时净值和估算涨跌幅 */
async function getFundEstimate(codes: string[]): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  await loadFundList();

  for (const code of codes) {
    try {
      const { data: raw } = await axios.get(
        `https://fundgz.1234567.com.cn/js/${code}.js`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer: "https://fund.eastmoney.com/",
          },
          timeout: 5000,
        },
      );
      const match = raw.match(/jsonpgz\((.+)\)/);
      if (!match) continue;
      const info = JSON.parse(match[1]);
      const fundName = info.name || fundMap?.get(code)?.name || "";
      const netValue = Number(info.dwjz) || 1;
      const estimateValue = Number(info.gsz) || netValue;
      const changePercent = Number(info.gszzl) || 0;
      const changeAmount = Number((estimateValue - netValue).toFixed(4));
      result[code] = {
        name: fundName,
        netValue,
        estimateValue,
        changePercent,
        changeAmount,
      };
    } catch {
      // 单个基金估值失败不影响其他基金
    }
  }

  return result;
}

// ---- 路由 ---- //

/** 基金代码 → 名称查询 */
router.post("/search", async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code: string };
    if (!code) {
      res.json(fail("缺少 code 参数"));
      return;
    }
    await loadFundList();
    const info = fundMap?.get(code);
    if (!info) {
      res.json(fail("未找到该基金代码"));
      return;
    }
    res.json(success({ code, name: info.name, pinyin: info.pinyin }));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/** 基金实时估值（最新净值 + 估算涨跌幅） */
router.post("/estimate", async (req: Request, res: Response) => {
  try {
    const { codes } = req.body as { codes: string[] };
    if (!codes || !codes.length) {
      res.json(fail("缺少 codes 参数"));
      return;
    }
    const data = await getFundEstimate(codes);
    res.json(success(data));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/** 获取持仓列表（自动计算当前市值、今日收益、持有收益率） */
router.post("/list", async (_req: Request, res: Response) => {
  try {
    const list = readPortfolio();
    const codes = list.map((item: any) => item.code);
    let estimates: Record<string, any> = {};
    if (codes.length > 0) {
      try {
        estimates = await getFundEstimate(codes);
      } catch {
        // 估值失败不影响列表展示，使用买入净值
      }
    }

    const data = list.map((item: any) => {
      const est = estimates[item.code];
      const currentNav = est?.estimateValue ?? item.buyNav;
      const currentValue = item.shares * currentNav;
      const todayProfit =
        est?.changeAmount != null ? item.shares * est.changeAmount : 0;
      const totalProfit = currentValue - item.amount;
      const profitRate =
        item.amount > 0 ? (currentValue / item.amount - 1) * 100 : 0;
      return {
        ...item,
        currentNav: Number(currentNav.toFixed(4)),
        currentValue: Number(currentValue.toFixed(2)),
        todayProfit: Number(todayProfit.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        profitRate: Number(profitRate.toFixed(2)),
      };
    });

    res.json(success(data));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/** 添加持仓记录（自动识别基金名称 + 获取当日净值计算份额） */
router.post("/add", async (req: Request, res: Response) => {
  try {
    const { code, name, amount } = req.body as {
      code: string;
      name?: string;
      amount: number;
    };
    if (!code) {
      res.json(fail("缺少 code 参数"));
      return;
    }
    if (!amount || amount <= 0) {
      res.json(fail("请输入有效的投入金额"));
      return;
    }

    // 自动补全基金名称
    let fundName = name || "";
    if (!fundName) {
      try {
        await loadFundList();
        fundName = fundMap?.get(code)?.name || "";
      } catch { /* 忽略 */ }
    }

    // 获取当日净值，用于计算份额
    let buyNav = 1;
    try {
      const est = await getFundEstimate([code]);
      if (est[code]?.estimateValue) {
        buyNav = est[code].estimateValue;
      }
    } catch { /* 忽略，使用默认值 */ }

    const shares = Number((amount / buyNav).toFixed(2));
    const list = readPortfolio();
    const item = {
      id: nextId(list),
      code,
      name: fundName || code,
      amount: Number(amount.toFixed(2)),
      shares,
      buyNav: Number(buyNav.toFixed(4)),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    list.push(item);
    writePortfolio(list);
    res.json(success({ id: item.id }));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/** 编辑持仓记录（可修改名称或投入金额，修改金额时重新计算份额） */
router.post("/update", async (req: Request, res: Response) => {
  try {
    const { id, name, amount } = req.body as {
      id: number;
      name?: string;
      amount?: number;
    };
    if (!id) {
      res.json(fail("缺少 id 参数"));
      return;
    }
    const list = readPortfolio();
    const idx = list.findIndex((i: any) => i.id === id);
    if (idx === -1) {
      res.json(fail("未找到该持仓记录"));
      return;
    }
    if (name !== undefined) list[idx].name = name;
    if (amount !== undefined && amount > 0) {
      list[idx].amount = Number(amount.toFixed(2));
      list[idx].shares = Number((amount / list[idx].buyNav).toFixed(2));
    }
    writePortfolio(list);
    res.json(success("ok"));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/** 删除持仓记录 */
router.post("/delete", async (req: Request, res: Response) => {
  try {
    const { id } = req.body as { id: number };
    if (!id) {
      res.json(fail("缺少 id 参数"));
      return;
    }
    let list = readPortfolio();
    list = list.filter((i: any) => i.id !== id);
    writePortfolio(list);
    res.json(success("ok"));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/** 持仓汇总（总资产、总投入、今日总收益、持有收益率） */
router.post("/summary", async (_req: Request, res: Response) => {
  try {
    const list = readPortfolio();
    const codes = list.map((item: any) => item.code);
    let estimates: Record<string, any> = {};
    if (codes.length > 0) {
      try {
        estimates = await getFundEstimate(codes);
      } catch { /* 忽略 */ }
    }

    let totalAssets = 0;
    let totalInvest = 0;
    let totalTodayProfit = 0;

    for (const item of list) {
      const est = estimates[item.code];
      const currentNav = est?.estimateValue ?? item.buyNav;
      const currentValue = item.shares * currentNav;
      totalAssets += currentValue;
      totalInvest += item.amount;
      if (est?.changeAmount != null) {
        totalTodayProfit += item.shares * est.changeAmount;
      }
    }

    const totalProfit = totalAssets - totalInvest;
    const profitRate =
      totalInvest > 0 ? (totalAssets / totalInvest - 1) * 100 : 0;

    res.json(
      success({
        totalAssets: Number(totalAssets.toFixed(2)),
        totalInvest: Number(totalInvest.toFixed(2)),
        totalTodayProfit: Number(totalTodayProfit.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        profitRate: Number(profitRate.toFixed(2)),
      }),
    );
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

export default router;
