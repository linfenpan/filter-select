'use strict';
const gulpTask = require('require-dir')('./gulpTask');
const gulp = require('gulp');

gulp.task('compress:auto', () => {
  gulpTask['auto-complete'].build();
});
gulp.task('compress:select', () => {
  gulpTask['filter-select'].build();
});
gulp.task('css', () => {
  gulpTask['css'].build();
});

gulp.task('default', ['compress:auto', 'compress:select', 'css']);
