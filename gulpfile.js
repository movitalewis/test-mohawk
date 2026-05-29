var gulp = require('gulp');
var gzip = require('gulp-gzip');
var minify = require('gulp-minify');

gulp.task('compress', function () {
return gulp

.src(['./dist/**/*.*'])
.pipe(gzip({ append: false }))
.pipe(gulp.dest('./distgzip'));
});

gulp.task('minify', function () {
return gulp

.src(['./dist/**/*.js'])
.pipe(minify({ append: false }))
.pipe(gulp.dest('./min'));

});