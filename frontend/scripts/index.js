const { program } = require('commander');
const { createProjectAction, addEntryAction, createViewAction } = require('./actions');

// program.option('-no --interfaceNo <No>', 'the project type:wealth');

program.option('-t --type <type>', '所属入口目录名，如 index、fundmarket');

program
  .command('create <name>')
  .description('在已有入口下创建视图组件和路由配置（含独立路由文件，自动注册）')
  .action(createProjectAction);

const add = program.command('add').description('创建新的入口或组件');

add
  .command('entry <name>')
  .description('创建完整的新页面入口（自动生成 index.html、main.ts、App.vue、router/、views/、components/）')
  .action(addEntryAction);

add
  .command('view <name>')
  .description('创建视图组件，路由直接写入 router/index.ts（不建独立路由文件）')
  .action(createViewAction);

program.parse(process.argv);
