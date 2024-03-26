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
  const result = await compileEjs('project.ts.ejs');

  fs.writeFile(`src/pages/${type}/views/${project}/index.vue`, result);
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

  fs.writeFile(`src/pages/${type}/router/${project}.ts`, result);
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
