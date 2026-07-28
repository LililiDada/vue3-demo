/**
 * 基金详情数据接口
 *
 * 功能：
 * - 实时估值走势（分时图）    POST /api/fund/realtime
 * - 历史净值走势（多周期）    POST /api/fund/nav-history
 * - 持仓股票列表（含实时行情） POST /api/fund/hold-stocks
 *
 * 数据来源：东方财富（East Money）公开接口
 * - 实时估值：fundgz.1234567.com.cn
 * - 分时走势：jfzfeed.eastmoney.com
 * - 历史净值：api.fund.eastmoney.com/f10/lsjz
 * - 持仓数据：api.fund.eastmoney.com/f10/FundArchivesDatas
 * - 股票行情：push2.eastmoney.com/api/qt/stock/get
 */

import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

// ---- 统一响应 ---- //

function success<T>(data: T) {
  return { code: 0, message: "success", data };
}

function fail(msg: string) {
  return { code: -1, message: msg, data: null };
}

// ---- 辅助函数 ---- //

/** 将周期标识转换为实际天数 */
function periodToDays(period: string): number {
  const map: Record<string, number> = {
    "1m": 30,
    "3m": 90,
    "6m": 180,
    "1y": 365,
    "3y": 1095,
  };
  return map[period] || 30;
}

// ============================================================
//  实时估值走势（分时图）
// ============================================================

/**
 * 获取基金日内实时估值走势数据
 *
 * 从两个数据源组合：
 *   1. fundgz → 最新估值、基金名称、涨跌幅
 *   2. jfzfeed → 交易时段内的分时估值点阵（x=分钟偏移, y=估算净值）
 *
 * 返回的数据包含当日的完整分时曲线，前端的走势图根据这些点绘制。
 */
async function getRealtimeTrend(code: string) {
  // 1. 获取最新估值快照
  const { data: gzRaw } = await axios.get(
    `https://fundgz.1234567.com.cn/js/${code}.js`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://fund.eastmoney.com/",
      },
      timeout: 5000,
    },
  );
  const gzMatch = gzRaw.match(/jsonpgz\((.+)\)/);
  if (!gzMatch) return null;
  const gzInfo = JSON.parse(gzMatch[1]);

  const estimateValue = Number(gzInfo.gsz) || 0;
  const netValue = Number(gzInfo.dwjz) || 1;
  const changePercent = Number(gzInfo.gszzl) || 0;
  const changeAmount = Number((estimateValue - netValue).toFixed(4));

  // 2. 获取日内分时数据
  let trend: { time: string; value: number }[] = [];
  try {
    const { data: trendRaw } = await axios.get(
      `https://jfzfeed.eastmoney.com/pj/${code}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 5000,
      },
    );
    // 响应格式: 函数包裹的 JSON 数组，每个元素 {x: 分钟数, y: 估值净值, zs: 归一化值}
    const trendMatch = trendRaw.match(/\[[\s\S]*?\]/);
    if (trendMatch) {
      const points = JSON.parse(trendMatch[0]);
      trend = points.map((p: any) => {
        const hours = String(Math.floor(p.x / 60)).padStart(2, "0");
        const mins = String(p.x % 60).padStart(2, "0");
        return { time: `${hours}:${mins}`, value: Number(Number(p.y).toFixed(4)) };
      });
    }
  } catch {
    // 分时数据获取失败，仅返回基础信息，trend 为空数组
  }

  return {
    code: gzInfo.fundcode,
    name: gzInfo.name || "",
    estimateValue,
    changePercent,
    changeAmount,
    updateTime: gzInfo.gztime || "",
    trend,
  };
}

// ============================================================
//  历史净值走势
// ============================================================

/**
 * 获取基金历史净值数据（单位净值 + 累计净值 + 日涨跌幅）
 *
 * 参数 period 控制返回数据量，前端可根据选择的 Tab（近 1 月 / 3 月 / …）传入：
 *   "1m" → 30 天  |  "3m" → 90 天  |  "6m" → 180 天
 *   "1y" → 365 天 |  "3y" → 1095 天
 *
 * 数据来自东方财富 lsjz 接口，按日期倒序排列（最新在前）。
 */
async function getNavHistory(code: string, days: number) {
  const pageSize = Math.min(days, 365);

  const { data: raw } = await axios.get(
    `https://api.fund.eastmoney.com/f10/lsjz`,
    {
      params: {
        callback: "",
        fundCode: code,
        pageIndex: 1,
        pageSize,
        startDate: "",
        endDate: "",
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `https://fundf10.eastmoney.com/`,
      },
      timeout: 5000,
    },
  );

  // 解析 JSONP 格式: jQueryXXXXX({...})
  const jsonMatch = raw.match(/\(([\s\S]*)\)/);
  if (!jsonMatch) return null;
  const body = JSON.parse(jsonMatch[1]);
  const list = (body.Data?.LSJZList || []).map((item: any) => ({
    date: item.FSRQ,
    unitNav: Number(item.DWJZ) || 0,
    accumNav: Number(item.LJJZ) || 0,
    dayChange: Number(item.JZZZL) || 0,
  }));

  // 获取基金名称
  let name = "";
  try {
    const { data: gzRaw } = await axios.get(
      `https://fundgz.1234567.com.cn/js/${code}.js`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://fund.eastmoney.com/",
        },
        timeout: 5000,
      },
    );
    const m = gzRaw.match(/jsonpgz\((.+)\)/);
    if (m) {
      const info = JSON.parse(m[1]);
      name = info.name || "";
    }
  } catch {
    // 获取名称失败不影响净值数据
  }

  return { code, name, list };
}

// ============================================================
//  持仓股票（含实时行情）
// ============================================================

/**
 * 获取基金持仓股票列表（前十大重仓股），并为每只股票补充实时行情
 *
 * 持仓数据来源：东方财富 FundArchivesDatas（季报披露的前十大持仓）
 * 行情数据来源：push2.eastmoney.com 股票实时接口
 *
 * 每只股票返回：代码、名称、占净值比、持仓市值、持仓数量、现价、涨跌幅
 */
async function getHoldStocks(code: string) {
  // 1. 获取基金名称
  let fundName = "";
  try {
    const { data: gzRaw } = await axios.get(
      `https://fundgz.1234567.com.cn/js/${code}.js`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://fund.eastmoney.com/",
        },
        timeout: 5000,
      },
    );
    const m = gzRaw.match(/jsonpgz\((.+)\)/);
    if (m) {
      const info = JSON.parse(m[1]);
      fundName = info.name || "";
    }
  } catch {
    // 忽略
  }

  // 2. 获取前十大持仓
  const { data: raw } = await axios.get(
    `https://api.fund.eastmoney.com/f10/FundArchivesDatas`,
    {
      params: {
        type: "jjcc",
        code,
        topline: 10,
        year: "",
        month: "",
        rt: Date.now(),
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `https://fundf10.eastmoney.com/`,
      },
      timeout: 5000,
    },
  );

  const body = typeof raw === "string" ? JSON.parse(raw) : raw;
  const stocks: any[] = body.Data?.Data || [];

  // 3. 并行查询每只股票实时行情
  const list = await Promise.all(
    stocks.map(async (stock: any) => {
      const stockCode: string = stock.STOCK_CODE || "";
      const stockName: string = stock.STOCK_NAME || "";
      const percent = Number(stock.PERCENT_OF_NET) || 0;
      const marketValue = Number(stock.STOCK_MARKET_VALUE) || 0;
      const shares = Number(stock.HOLD_NUM) || 0;

      // 查询股票实时价格和涨跌幅
      let price = 0;
      let changePercent = 0;
      if (stockCode) {
        try {
          // 上交所: 6xx / 68x → secid=1.xxx，深交所: 0xx/3xx → secid=0.xxx
          const prefix = stockCode.startsWith("6") ? "1" : "0";
          const { data: spRaw } = await axios.get(
            `https://push2.eastmoney.com/api/qt/stock/get`,
            {
              params: {
                secid: `${prefix}.${stockCode}`,
                fields: "f43,f170", // f43=现价, f170=涨跌幅(%)
              },
              headers: { "User-Agent": "Mozilla/5.0" },
              timeout: 5000,
            },
          );
          if (spRaw?.data) {
            price = spRaw.data.f43 || 0;
            changePercent = spRaw.data.f170 || 0;
          }
        } catch {
          // 单只股票行情失败不影响其他股票
        }
      }

      return {
        stockCode,
        stockName,
        percent: Number(percent.toFixed(2)),
        marketValue: Number(marketValue.toFixed(2)),
        shares: Number(shares.toFixed(0)),
        price: Number(price.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
      };
    }),
  );

  return { code, name: fundName, list };
}

// ============================================================
//  路由定义
// ============================================================

/**
 * POST /api/fund/realtime
 *
 * 获取基金实时估值及日内分时走势
 *
 * 请求: { code: "003095" }
 * 响应: {
 *   code, name, estimateValue, changePercent, changeAmount,
 *   updateTime, trend: [{ time, value }]
 * }
 */
router.post("/realtime", async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code: string };
    if (!code) {
      res.json(fail("缺少 code 参数"));
      return;
    }
    const data = await getRealtimeTrend(code);
    if (!data) {
      res.json(fail("获取实时估值数据失败"));
      return;
    }
    res.json(success(data));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/**
 * POST /api/fund/nav-history
 *
 * 获取基金历史净值走势（按日）
 *
 * 请求: { code: "003095", period: "1m" }
 *   period 可选值: "1m" | "3m" | "6m" | "1y" | "3y"，默认 "1m"
 * 响应: {
 *   code, name,
 *   list: [{ date, unitNav, accumNav, dayChange }]
 * }
 */
router.post("/nav-history", async (req: Request, res: Response) => {
  try {
    const { code, period = "1m" } = req.body as {
      code: string;
      period?: string;
    };
    if (!code) {
      res.json(fail("缺少 code 参数"));
      return;
    }
    const days = periodToDays(period);
    const data = await getNavHistory(code, days);
    if (!data) {
      res.json(fail("获取历史净值数据失败"));
      return;
    }
    res.json(success(data));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

/**
 * POST /api/fund/hold-stocks
 *
 * 获取基金持仓股票列表（前十大重仓股，含实时行情）
 *
 * 请求: { code: "003095" }
 * 响应: {
 *   code, name,
 *   list: [{ stockCode, stockName, percent, marketValue, shares, price, changePercent }]
 * }
 */
router.post("/hold-stocks", async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code: string };
    if (!code) {
      res.json(fail("缺少 code 参数"));
      return;
    }
    const data = await getHoldStocks(code);
    if (!data) {
      res.json(fail("获取持仓股票数据失败"));
      return;
    }
    res.json(success(data));
  } catch (e: any) {
    res.json(fail(e.message));
  }
});

export default router;
