const path = require('path');

module.exports = {
  entry: './src/js/game.js',
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'dist')
  }
};