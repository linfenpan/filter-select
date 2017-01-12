'use strict';
const common = require('./common');
const gulp = require('gulp');

module.exports = {
  build() {
    const src = common.src;
    const transform = common.getJsTranform('filter-select', 'FilterSelect');
    gulp.src([`${src}/common.js`, `${src}/auto-complete.js`, `${src}/filter-select.js`]).pipe(transform());
  }
};
