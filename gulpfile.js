/* eslint-env node */

let gulp = require('gulp');
let autoprefixer = require('gulp-autoprefixer');
//let browserSync = require('browser-sync').create();
//let eslint = require('gulp-eslint');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify-es').default;
let cleanCSS = require('gulp-clean-css');


gulp.task('copy-styles', copyStylesTask);
//gulp.task('lint', lintTask);
gulp.task('copy-html', copyHtmlTask);
gulp.task('copy-scripts', copyScriptsTask);
gulp.task('scripts-dist', scriptsDistTask);
gulp.task('default', gulp.series(['copy-html', 'copy-styles', 'copy-scripts', 'scripts-dist']));

function copyHtmlTask(done) {
  gulp.src('./*.html')
    .pipe(gulp.dest('./dist'));
  done();
}

function copyStylesTask(done) {
  gulp.src('css/*.css')
    .pipe(autoprefixer({
      browsers: ['last 3 versions']
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('./dist/css'));
  done();
}

function copyScriptsTask(done) {
  gulp.src('./js/library/*')
    .pipe(gulp.dest('./dist/js/library'));

  gulp.src('./sw.js')
    .pipe(gulp.dest('./dist'));
  done();
}

function scriptsDistTask(done) {
  gulp.src(['js/*.js', '!js/main.js'])
    .pipe(concat('allRestaurant.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));

  gulp.src(['js/*.js', '!js/restaurant_info.js'])
    .pipe(concat('allIndex.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
  done();
}

// function lintTask(done) {
//   gulp.src('js/**/*.js')
//   // eslint() attaches the lint output to the eslint property
//   // of the file object so it can be used by other modules.
//     .pipe(eslint())
//   // eslint.format() outputs the lint results to the console.
//   // Alternatively use eslint.formatEach() (see Docs).
//     .pipe(eslint.format())
//   /* To have the process exit with an error code (1) on
//    lint error, return the stream and pipe to failOnError last.*/
//     .pipe(eslint.failAfterError());
//   done();
// }
