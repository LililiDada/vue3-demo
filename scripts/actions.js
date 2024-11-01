const { firstLetterLower, firstLetterUpper, compileEjs } = require('./utils');
const { program } = require('commander');
const fs = require('fs');

function createProjectAction(project) {
  const type = program.opts().type;
  const hasTypeDir = fs.existsSync(`src/pages/${type}`);

  if (!hasTypeDir) {
    console.log('请勿添加项目大类');
    return;
  }

  const name = firstLetterLower(project);
  const upperName = firstLetterUpper(project);
  createVueAction(name);
  createRouteAction(name, upperName);
}

async function createVueAction(project) {
  const type = program.opts().type;
  if (fs.existsSync(`src/pages/${type}/views/${project}`)) {
    console.log('文件已存在');
    return;
  }

  // 同步创建目录
  fs.mkdirSync(`src/pages/${type}/views/${project}`);
  const result = await compileEjs('project.vue.ejs');

  fs.promises.writeFile(`src/pages/${type}/views/${project}/index.vue`, result);
}

async function createRouteAction(project, upperName) {
  const type = program.opts().type;
  if (fs.existsSync(`src/pages/${type}/router/${project}.ts`)) {
    console.log('文件已存在');
    return;
  }

  const result = await compileEjs('route.ts.ejs', {
    name: upperName,
    lowername: project,
    type: type,
  });

  fs.promises.writeFile(`src/pages/${type}/router/${project}.ts`, result);

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
      // 查找最后一个 import 语句的位置
      const lastImportIndex = modifiedContent.lastIndexOf('import');

      if (lastImportIndex !== -1) {
        // 在最后一个 import 语句后插入新的 import
        const lastImportLineEnd = modifiedContent.indexOf(
          '\n',
          lastImportIndex,
        );

        // 如果没有找到换行符，说明是最后一行
        // const insertPosition =
        //   lastImportLineEnd === -1 ? modifiedContent.length : lastImportLineEnd;

        modifiedContent =
          modifiedContent.slice(0, lastImportLineEnd) +
          importStatement +
          modifiedContent.slice(lastImportLineEnd);
      } else {
        // 如果没有 import 语句，则直接添加
        modifiedContent = importStatement + modifiedContent;
      }
    }

    // 更新addRoutes,加入新模块
    modifiedContent = modifiedContent.replace(
      /addRoutes\(\[([^\]]*)\]\);/,
      (match, p1) => {
        return 'addRoutes([' + p1.trim() + ',...' + project + ']);';
      },
    );

    fs.promises.writeFile(`src/pages/${type}/router/index.ts`, modifiedContent);
  });
}

// async function createStoreAction(project, upperName) {
//   const type = program.opts().type;

//   if (fs.existsSync(`src/pages/${type}/store/${project}.ts`)) {
//     console.log('文件已存在');
//     return;
//   }

//   const result = await compileEjs('store.ts.ejs', {
//     name: upperName,
//     lowername: project,
//   });
//   fs.writeFile(`src/pages/${type}/store/${project}.ts`, result);
// }

module.exports = {
  createProjectAction,
};
