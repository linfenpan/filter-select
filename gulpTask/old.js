'use strict';
const gulp = require('gulp');
const common = require('./common');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const lazypipe = require('lazypipe');

module.exports = {
  build() {
    const fnAutoKey = require('./auto-key').getAutoKeyBuilder();
    gulp.src('./src/filterSelect.js')
      .pipe(header(common.banner.replace(/v\d\.\d\.\d/, 'v1.0.0 old version ') + '\n'))
      .pipe(gulp.dest(common.dist))
      .pipe(uglify({
        preserveComments: 'some'
      }))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(replace(/(_+\w+?)\b/g, (str, key) => {
        return '_f' + fnAutoKey(key);
      }))
      .pipe(gulp.dest(common.dist));
  }
};
