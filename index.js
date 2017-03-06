'use strict';
const path = require('path');
const inlineSource = require('inline-source');
const fs = require('fs');
const debug = require('debug')('webpack:plugin:inline');

function InlinePlugin(/* options */) {
  // Setup the plugin instance with options...
}

InlinePlugin.prototype.apply = function(compiler) {
  compiler.plugin('after-emit', function(compilation, callback) {
    const cwd = process.cwd();
    debug('outputpath: %s', compilation.outputOptions.path);
    const htmlFileNames = Object.keys(compilation.assets).filter(file => /\.html$/.test(file));
    htmlFileNames.reduce((promise, filename) => promise.then(() => {
      const viewName = path.basename(filename, path.extname(filename));
      debug(`viewname: ${viewName}`);
      const rootpath = path.resolve(cwd, `app/views/${viewName}`);
      debug(`rootpath: ${rootpath}`);
      const htmlAsset = compilation.assets[filename];
      const source = htmlAsset.source();
      return inlineHtmlSource(source, {
        compress: true,
        diskpath: htmlAsset.existsAt,
        rootpath,
      }).then(() => {});
    }), Promise.resolve())
    .then(() => callback())
    .catch(err => {
      console.log(err);
      throw err;
    });
  });
};


function inlineHtmlSource(source, options) {
  return new Promise((resolve, reject) => {
    inlineSource(source, options, function(err, html) {
      if (err) {
        return reject(err);
      }
      fs.readFile(options.diskpath, err => {
        if (err) {
          return reject(err);
        }
        // const fileContent = data.toString()
        fs.writeFile(options.diskpath, html, err => {
          if (err) {
            return reject(err);
          }
          resolve(html);
        });
      });
    });
  });
}

module.exports = InlinePlugin;
