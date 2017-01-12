'use strict';
const common = require('./common');
const header = require('gulp-header');
const gulp = require('gulp');

module.exports = {
  build() {
    gulp.src(`${common.src}/filterSelect.css`)
      .pipe(header(common.banner))
      .pipe(gulp.dest(common.dist));
  }
};
