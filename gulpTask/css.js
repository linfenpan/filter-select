'use strict';
const common = require('./common');
const header = require('gulp-header');
const gulp = require('gulp');
const concat = require("gulp-concat");

module.exports = {
  build() {
    gulp.src(`${common.src}/auto-complete.css`)
      .pipe(header(common.banner + '\n'))
      .pipe(gulp.dest(common.dist));

    gulp.src([`${common.src}/auto-complete.css`, `${common.src}/filter-select.css`])
      .pipe(concat('filter-select.css'))
      .pipe(header(common.banner + '\n'))
      .pipe(gulp.dest(common.dist));
  }
};
