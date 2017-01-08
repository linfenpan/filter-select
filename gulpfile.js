'use strict';

const gulp = require('gulp');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const today = new Date();
const pkg = require('./package.json');
const banner = `/*! by da宗熊 MIT v${pkg.version} update:${today.getFullYear()}/${today.getMonth()}/${today.getDate()} git:https://github.com/linfenpan/filter-select*/\n`;

const replaceMap = {};
let replaceIndex = 1;
function getReplaceKey(key) {
  if (!replaceMap[key]) {
    replaceMap[key] = replaceIndex++;
  }
  return replaceMap[key];
}

gulp.task('compress:js', () => {
  gulp.src('./src/filterSelect.js')
    .pipe(
      header(banner)
    )
    .pipe(
      gulp.dest('./dist')
    )
    .pipe(
      uglify({
        preserveComments: 'some'
      })
    )
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(
      replace(/(_+\w+?)\b/g, (str, key) => {
        return '_f' + getReplaceKey(key)
      })
    )
    .pipe(
      gulp.dest('./dist')
    );
});

gulp.task('compress:css', () => {
  gulp.src('./src/filterSelect.css')
    .pipe(
      header(banner)
    )
    .pipe(
      gulp.dest('./dist')
    );
});

gulp.task('default', ['compress:js', 'compress:css']);
