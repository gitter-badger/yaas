/**
 * Main build file.
 *
 * @author  Siyuan Gao <siyuangao@gmail.com>
 * @author  Denis Luchkin-Zhou <wyvernzora@gmail.com>
 * @license Apache 2.0
 */

var gulp           = require('gulp');
var jscs           = require('gulp-jscs');
var babel          = require('gulp-babel');
var mocha          = require('gulp-mocha');
var jshint         = require('gulp-jshint');
var stylish        = require('gulp-jscs-stylish');
var istanbul       = require('gulp-istanbul');
var sourcemaps     = require('gulp-sourcemaps');
var del            = require('del');
var bump           = require('gulp-bump');

/*!
 * Aliases
 */
gulp.task('patch', ['clean','build', 'bump']);

gulp.task('default', ['clean','build']);

gulp.task('major', ['clean','build', 'bumpmajor']);

gulp.task('minor', ['clean','build', 'bumpminor']);
/*!
 * Builds script files.
 * Ignore fixtures
 */
gulp.task('build', function() {

  gulp.src(['src/**/*.js'], { base: 'src' })
        .pipe(sourcemaps.init())
        .pipe(babel({
            auxiliaryCommentBefore: 'istanbul ignore next'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('lib'));

});

/*!
 *  Delete the build folder
 */
gulp.task('clean', function() {
    return del(['lib/**/*']);
});


/*!
 * Masochistic code quality check.
 */
gulp.task('lint', function() {

  gulp.src(['src/**/*.js', 'test/**/*.js'])
        .pipe(jshint({
              lookup:    false,
              esnext:    true,
              curly:     true,
              eqeqeq:    true,
              freeze:    true,
              funcscope: true,
              undef:     true,
              predef: [
                    '__dirname',
                    'require',
                    'process',
                    'exports',
                    'module',
                    'console'
              ]
        }))
        .pipe(jscs({
          esnext:  true,
          requireCamelCaseOrUpperCaseIdentifiers: 'ignoreProperties'
        }))
        .on('error', function() { })
        .pipe(stylish.combineWithHintResults())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));

});

/*!
 * Mocha tests.
 */
gulp.task('test', ['lint', 'build'], function() {

  gulp.src(['test/index.spec.js'], { read: false })
    .pipe(mocha({ reporter: 'spec' }));

});

/*!
 * Code coverage.
 */
gulp.task('cover', ['lint', 'build'], function(done) {

 gulp.src(['src/**/*.js'])
   .pipe(istanbul({babel: { stage: 0 }}))
   .pipe(istanbul.hookRequire())
   .on('finish', function() {
     gulp.src(['test/index.spec.js'])
       .pipe(mocha())
       .pipe(istanbul.writeReports({
         dir: 'coverage',
         reportOpts: { dir: 'coverage' },
         reporters: ['text', 'text-summary', 'json', 'html']
       }))
       .on('end', done);
   });

});

/*!
 * Rebuild on change.
 */
gulp.task('watch', function() {

  gulp.watch(['src/**/*.js'], ['build']);

});

/*!
 *  verion bump
 */
gulp.task('bump', function(){
    gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('bumpmajor', function(){
    gulp.src('./package.json')
        .pipe(bump({type:'major'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bumpminor', function(){
    gulp.src('./package.json')
        .pipe(bump({type:'minor'}))
        .pipe(gulp.dest('./'));
});

