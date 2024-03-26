const { program } = require('commander');
const { createProjectAction } = require('./actions');

// program.option('-no --interfaceNo <No>', 'the project type:wealth');

program.option('-t --type <type>', 'the project type, eg: wealth');

program
  .command('create <project>')
  .description('create vue project info a folder')
  .action(createProjectAction);

program
  .command('ic')
  .description('create vue project info a folder')
  .action(createProjectAction);

program.parse(process.argv);
