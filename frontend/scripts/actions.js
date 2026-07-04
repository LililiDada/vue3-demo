const { firstLetterLower, firstLetterUpper, compileEjs } = require('./utils');
const { program } = require('commander');
const fs = require('fs');

/**
 * create 命令的处理函数。
 * 在已有入口下创建视图组件和路由配置。
 *
 * 执行流程：
 *   1. 检查 -t 指定的入口目录是否存在（src/pages/<type>）
 *   2. 驼峰转换视图名
 *   3. 创建视图文件（src/pages/<type>/views/<name>/index.vue）
 *   4. 创建路由文件（src/pages/<type>/router/<name>.ts）并自动注册到 router/index.ts
 *
 * @param {string} project - 视图名，如 test、mySetting
 */
function createProjectAction(project) {
  const type = program.opts().type;
  const hasTypeDir = fs.existsSync(`src/pages/${type}`);

  if (!hasTypeDir) {
    console.log('未找到想要添加项目大类（入口）');
    return;
  }

  const name = firstLetterLower(project);
  const upperName = firstLetterUpper(project);
  createVueAction(name);
  createRouteAction(name, upperName);
}

/**
 * 在指定入口下创建视图组件文件。
 * 生成 src/pages/<type>/views/<name>/index.vue。
 *
 * @param {string} project - 小驼峰视图名
 */
async function createVueAction(project) {
  const type = program.opts().type;
  if (fs.existsSync(`src/pages/${type}/views/${project}`)) {
    console.log('文件已存在');
    return;
  }

  fs.mkdirSync(`src/pages/${type}/views/${project}`);
  const result = await compileEjs('create/project.vue.ejs', {
    lowername: project,
  });

  fs.promises.writeFile(`src/pages/${type}/views/${project}/index.vue`, result);
}

/**
 * 在指定入口下创建路由配置，并自动注册到 router/index.ts。
 *
 * 做的事：
 *   1. 根据模板生成 router/<name>.ts（含 import 和路由定义）
 *   2. 读取 router/index.ts，插入新的 import 语句
 *   3. 在 addRoutes([...]) 中添加新的路由模块展开
 *
 * @param {string} project  - 小驼峰视图名
 * @param {string} upperName - 大驼峰视图名（用于路由命名）
 */
async function createRouteAction(project, upperName) {
  const type = program.opts().type;
  if (fs.existsSync(`src/pages/${type}/router/${project}.ts`)) {
    console.log('文件已存在');
    return;
  }

  const result = await compileEjs('create/route.ts.ejs', {
    name: upperName,
    lowername: project,
    type: type,
  });

  fs.promises.writeFile(`src/pages/${type}/router/${project}.ts`, result);

  // 读取 router/index.ts，注入 import 和 addRoutes 注册
  fs.readFile(`src/pages/${type}/router/index.ts`, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    const importStatement = `import ${project} from './${project}';\n`;
    const importRegx = new RegExp(
      `import\\s+${project}\\s+from\\s+'\\.\\/${project}';`,
    );

    let modifiedContent = data;
    if (!importRegx.test(data)) {
      // 找到最后一条 import ... from '...' 语句，在其后插入新 import
      const importLineRegex = /^import\s+.+?\s+from\s+['"][^'"]+['"];?\s*$/gm;
      const importLines = [...data.matchAll(importLineRegex)];

      if (importLines.length > 0) {
        const lastImport = importLines[importLines.length - 1];
        const insertPos = lastImport.index + lastImport[0].length;
        modifiedContent =
          modifiedContent.slice(0, insertPos) +
          '\n' +
          importStatement +
          modifiedContent.slice(insertPos);
      } else {
        modifiedContent = importStatement + modifiedContent;
      }
    }

    // 在 addRoutes([...]) 中展开新模块，如 addRoutes([...other, ...test])
    modifiedContent = modifiedContent.replace(
      /addRoutes\(\[([^\]]*)\]\);/,
      (match, p1) => {
        return 'addRoutes([' + p1.trim() + ',...' + project + ']);';
      },
    );

    fs.promises.writeFile(`src/pages/${type}/router/index.ts`, modifiedContent);
  });
}

/**
 * add entry 命令的处理函数。
 * 创建一个全新的页面入口，自动生成入口所需的文件和目录。
 *
 * 生成结构：
 *   src/pages/<name>/
 *     index.html       — HTML 壳（含 script src="./main.ts"）
 *     main.ts          — 入口文件（createApp + router + pinia）
 *     App.vue          — 根组件（含 router-view 骨架）
 *     router/index.ts  — 路由配置（addRoutes 空壳）
 *     views/           — 视图组件目录（空）
 *     components/      — 公共组件目录（空）
 *
 * 创建完成后重启 dev server，readPages() 会自动扫描识别新入口，
 * 通过 http://localhost:5173/<name> 即可访问。
 *
 * @param {string} name - 入口名，小写英文，如 fundmarket、mypage
 */
async function addEntryAction(name) {
  // 限制入口名为纯小写英文，如 fundmarket、mypage
  if (!/^[a-z]+$/.test(name)) {
    console.log('入口名只支持小写英文字母（a-z），如 fundmarket、mypage');
    return;
  }

  const entryDir = `src/pages/${name}`;
  if (fs.existsSync(entryDir)) {
    console.log(`入口 ${name} 已存在`);
    return;
  }

  // 创建目录结构
  fs.mkdirSync(`${entryDir}/views`, { recursive: true });
  fs.mkdirSync(`${entryDir}/components`, { recursive: true });
  fs.mkdirSync(`${entryDir}/router`, { recursive: true });

  // 通过 EJS 模板生成入口文件
  const html = await compileEjs('add-entry/entry.html.ejs', { name });
  const main = await compileEjs('add-entry/entry.main.ts.ejs', { name });
  const app = await compileEjs('add-entry/entry.App.vue.ejs', { name });
  const routerIndex = await compileEjs('add-entry/entry.router.ts.ejs', {
    name,
  });

  // 写入文件
  fs.promises.writeFile(`${entryDir}/index.html`, html);
  fs.promises.writeFile(`${entryDir}/main.ts`, main);
  fs.promises.writeFile(`${entryDir}/App.vue`, app);
  fs.promises.writeFile(`${entryDir}/router/index.ts`, routerIndex);

  console.log(`入口 ${name} 创建成功，重启 dev server 后可通过 /${name} 访问`);
}

/**
 * create view 命令的处理函数。
 * 创建视图组件，路由配置直接写入 router/index.ts（不建独立路由文件）。
 *
 * 执行流程：
 *   1. 同 create 命令创建视图文件
 *   2. 读取 router/index.ts，注入 RouteRecordRaw import（如缺失）
 *   3. 在 addRoutes() 前插入路由对象定义
 *   4. 将变量名追加到 addRoutes([...]) 数组中
 *
 * @param {string} name - 视图名，如 test、mySetting
 */
async function createViewAction(name) {
  const type = program.opts().type;
  const hasTypeDir = fs.existsSync(`src/pages/${type}`);

  if (!hasTypeDir) {
    console.log('请勿重复添加项目入口大类');
    return;
  }

  const lowerName = firstLetterLower(name);
  const upperName = firstLetterUpper(name);

  // 创建视图组件（使用简单模板，不复用 createVueAction）
  const vuePath = `src/pages/${type}/views/${lowerName}.vue`;
  if (fs.existsSync(vuePath)) {
    console.log('文件已存在');
    return;
  }
  const vueResult = await compileEjs('add-view/project.vue.ejs', {
    lowername: lowerName,
  });
  await fs.promises.writeFile(vuePath, vueResult);

  // 构建路由对象字符串
  const routeDef = `\nconst ${upperName}: RouteRecordRaw = {\n  path: '${lowerName}',\n  name: '${upperName}Index',\n  component: () => import(/* webpackChunkName: '${type}' */ '@/pages/${type}/views/${lowerName}.vue'),\n  children: [],\n};`;

  const filePath = `src/pages/${type}/router/index.ts`;

  try {
    const data = fs.readFileSync(filePath, 'utf-8');

    let modifiedContent = data;

    // 确保 import { RouteRecordRaw } from 'vue-router' 已引入
    if (!modifiedContent.includes('RouteRecordRaw')) {
      modifiedContent = modifiedContent.replace(
        /^import router, \{addRoutes\} from '@\/router';/m,
        `import router, {addRoutes} from '@/router';\nimport { RouteRecordRaw } from 'vue-router';`,
      );
    }

    // 在 addRoutes 之前插入路由定义
    modifiedContent = modifiedContent.replace(
      /addRoutes\(/,
      routeDef + '\n\naddRoutes(',
    );

    // 在 addRoutes([]) 数组中追加路由变量
    modifiedContent = modifiedContent.replace(
      /addRoutes\(\[([^\]]*)\]\);\n?/,
      (match, inner) => {
        const trimmed = inner.trim();
        if (trimmed === '') {
          return `addRoutes([${upperName}]);\n`;
        }
        return `addRoutes([${trimmed}, ${upperName}]);\n`;
      },
    );

    await fs.promises.writeFile(filePath, modifiedContent);

    if (modifiedContent !== data) {
      console.log(
        `路由 ${upperName}（${lowerName}）已直接注册到 router/index.ts`,
      );
    } else {
      console.log('未检测到变更，路由可能已存在');
    }
  } catch (err) {
    console.error('读取 router/index.ts 出错:', err.message);
  }
}

module.exports = {
  createProjectAction,
  addEntryAction,
  createViewAction,
};
