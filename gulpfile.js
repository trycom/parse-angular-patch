// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

// Lint Task
gulp.task('lint', function() {
    gulp.src('./src/parse-angular.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
    gulp.src('./src/parse-angular.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

// Default Task
gulp.task('default', ['lint', 'uglify']);