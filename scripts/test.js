const fs = require('fs');

fs.readFile(
  `E:/keep/vue3-demo/src/pages/index/router/index.ts`,
  'utf-8',
  (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    const project = 'text';
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

        modifiedContent =
          modifiedContent.slice(0, lastImportLineEnd) +
          importStatement +
          modifiedContent.slice(lastImportLineEnd);
      } else {
        // 如果没有 import 语句，则直接添加
        modifiedContent = importStatement + modifiedContent;
      }

      // 更新addRoutes,加入新模块
      modifiedContent.replace(/addRoutes\(\[([^\]]*)\]\);/, (match, p1) => {
        return `addRoutes([${p1.trim()},...${project}]`;
      });

      // console.log('======modifiedContent', modifiedContent);
    }
  },
);
