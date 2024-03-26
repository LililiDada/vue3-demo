const ejs = require('ejs');
const path = require('path');

function firstLetterLower(word) {
  const result = word.charAt(0).toLowerCase() + word.slice(1);
  return result;
}

function firstLetterUpper(word) {
  const result = word.charAt(0).toUpperCase() + word.slice(1);
  return result;
}

function compileEjs(tempName, data) {
  return new Promise((resolve, reject) => {
    const tempPath = `./template/${tempName}`;
    const absolutePath = path.resolve(__dirname, tempPath);
    ejs.renderFile(absolutePath, data, (err, result) => {
      if (err) {
        console.log(err, 'err');
        reject(err);
        return;
      }

      resolve(result);
    });
  });
}

module.exports = {
  firstLetterLower,
  firstLetterUpper,
  compileEjs,
};
