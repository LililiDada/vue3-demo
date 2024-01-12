/* eslint-disable */
module.exports = {
  plugins: [
    require('postcss-px-to-viewport')({
      viewportWidth: 375,
      viewportUnit: 'vw',
    }),
    require('postcss-preset-env'),
  ],
};
