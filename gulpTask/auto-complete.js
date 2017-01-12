'use strict';
const common = require('./common');
const gulp = require('gulp');

module.exports = {
  build() {
    const src = common.src;
    const transform = common.getJsTranform('auto-complete', 'AutoComplete');
    gulp.src([`${src}/common.js`, `${src}/auto-complete.js`]).pipe(transform());
  }
};
