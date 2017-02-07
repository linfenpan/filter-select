'use strict';
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require("gulp-concat");
const header = require('gulp-header');
const footer = require('gulp-footer');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const lazypipe = require('lazypipe');

const today = new Date();
const pkg = require('../package.json');
const banner = `/*! by da宗熊 MIT v${pkg.version} update:${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()} git:https://github.com/linfenpan/filter-select */`;

module.exports = {
  dist: './dist',
  src: './src',
  banner,
  getJsTranform(name, fnName) {
    const textHeader = `${banner}\n
;(function(ctx, name, defination) {
  ctx[name] = defination(ctx);
})(window, '${fnName}', function(win) {\n\n`;

    const textFooter = `\n\n
    return ${fnName};
});`;

    const fnAutoKey = require('./auto-key').getAutoKeyBuilder();
    const jsTransform = lazypipe()
      .pipe(concat, name + '.js')
      .pipe(header, textHeader)
      .pipe(footer, textFooter)
      .pipe(gulp.dest, `${this.dist}`)
      .pipe(replace, /(_+\w+?)\b/g, (str, key) => {
        return '_f' + fnAutoKey(key);
      })
      .pipe(uglify, {
        preserveComments: 'some'
      })
      .pipe(rename, { suffix: '.min' })
      .pipe(gulp.dest, `${this.dist}`);

    return jsTransform;
  }
};
