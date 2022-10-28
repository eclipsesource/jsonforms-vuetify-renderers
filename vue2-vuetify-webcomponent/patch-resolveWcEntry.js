const fs = require('fs');
const glob = require('glob');
const replace = require('replace-in-file');
const resolveWcConfig =
  '../node_modules/@vue/cli-service/lib/commands/build/resolveWcConfig.js';

glob(resolveWcConfig, null, (err, files) => {
  if (err) {
    return console.error(err);
  } else {
    replace(
      {
        files,
        from: 'chunkFilename: `${libName}.[name]${minify ? `.min` : ``}.js`,',
        to: 'chunkFilename: `${libName}.[name].[contenthash]${minify ? `.min` : ``}.js`,',
      },
      (err, results) => {
        if (err) {
          return console.error(err);
        }
      }
    );
  }
});
