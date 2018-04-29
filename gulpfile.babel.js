"use strict";

import gulp from 'gulp';
import babel from 'gulp-babel';
	var babelcore = require('babel-core'),
	sass = require('gulp-sass'),
	gulpUtil = require('gulp-util'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	prefix = require('gulp-autoprefixer'),
	git = require('gulp-git'),
	htmlmin = require('gulp-htmlmin'),
	strip = require('gulp-strip-comments'),
	dir = require('gulp-dest'),
	//pagespeed = require('pagespeed'),
	browserSync = require('browser-sync').create();
var useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	cssmin = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	rimraf = require('rimraf'),
	notify = require('gulp-notify'),
	imagemin = require('gulp-tinify'),
	fontIcon = require("gulp-font-icon"),
	gitignore = require('gulp-gitignore'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css');
	//ftp = require('vinyl-ftp');
var paths = {
		sass: 'app/sass/*.sass',
		html: 'app/*.html',
		js: 'app/js/*.js',
		ecma6: 'app/es6/*.js',
		devDir: 'app/',
		outputDir: 'build/',
		svgTo: 'app/font_icons',
		svgFrom: 'app/icons/*.svg'
};
	require('babel-register');

	/*********************************
		Developer tasks
*********************************/
//svg
gulp.task('iconfont', function(){
	gulp.src(paths.svgFrom)
		.pipe(iconfontCss({
			fontName: 'mf',
		}))
		.pipe(iconfont({
			fontName: 'mf',
			normalize: true,
			fontHeight: 1001
		}))
	.pipe(gulp.dest(paths.svgTo));
});
//sass compile
gulp.task('sass', function() {
	return gulp.src(paths.sass)
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix({
			browsers: ['last 10 versions'],
			cascade: true
		}))
		.pipe(gulp.dest(paths.devDir + 'css/'))
		.pipe(browserSync.stream());
});
// ecma
gulp.task('es6', () => {
	gulp.src(paths.devDir + 'es6/*.js')
	.pipe(babel())
	.pipe(gulp.dest(paths.devDir + 'js/'))
});
//js compile
gulp.task('scripts', function() {
	return gulp.src([
			paths.js
		])
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.devDir + 'js/'))
		.pipe(browserSync.stream());
});
gulp.task('htmls', function(){
  gulp.src(paths.html)
  .pipe(browserSync.stream());
});
//watch
gulp.task('watch', function() {
	gulp.watch(paths.html, ['htmls']);
	gulp.watch(paths.ecma6, ['es6']);
	gulp.watch(paths.sass, ['sass']);
	gulp.watch(paths.js, ['scripts']);
});

//server
gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: paths.devDir
		}
	});
});


/*********************************
		Production tasks
*********************************/
//clean
gulp.task('clean', function(cb) {
	rimraf(paths.outputDir, cb);
});
//css + js
gulp.task('build', ['clean'], function () {
	return gulp.src(paths.devDir + '*.html')
		.pipe( useref() )
		.pipe( gulp.dest(paths.outputDir))
		//.pipe( gulpif(['*.js', '!app/es6/*.js'], uglify()) )
		.pipe( gulpif('*.js', uglify()) )
		.pipe( gulpif('*.css', cssmin()) )
		.pipe( gulp.dest(paths.outputDir) );
});
// copy images to outputDir
gulp.task('imgBuild', ['clean'], function() {
	return gulp.src(paths.devDir + 'img/**/*')
		.pipe(imagemin('480DKIlZJUpG8I-LDzmYbgta6fLj0Vfg'))
		.pipe(gulp.dest(paths.outputDir + 'img/'));
});

//copy fonts to outputDir
gulp.task('fontsBuild', ['clean'], function() {
	return gulp.src(paths.devDir + '/fonts/*')
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
});

//ftp
gulp.task('send', function() {
	var conn = ftp.create({
		host:     '----',
		user:     '----',
		password: '----`',
		parallel: 5
	});

	/* list all files you wish to ftp in the glob variable */
	var globs = [
		'build/**/*',
		'!node_modules/**' // if you wish to exclude directories, start the item with an !
	];

	return gulp.src( globs, { base: '.', buffer: false } )
		.pipe( conn.newer( '/' ) ) // only upload newer files
		.pipe( conn.dest( '/' ) )
		.pipe(notify("Dev site updated!"));

});


//default

//var place = this.pipe(gulp.dest())
gulp.task('final', function() {
  return gulp.src(paths.outputDir + '*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.outputDir))
});




// gulp.task('comments', function () {

// 	var allFiles = ['scripts/', '', 'css/'];

// 	for (var i = 0; i < allFiles.length; i++){
// 		gulpUtil.log(allFiles[i]);
// 		return gulp.src(paths.outputDir + '**/*')
// 		.pipe(strip({
// 			safe: true
// 		}))
// 		.pipe(gulp.dest(paths.outputDir + allFiles[i++]))
		
// 	}
// });



gulp.task('default', ['browser-sync', 'watch', 'es6', 'sass', 'scripts']);

gulp.task('prod', ['build', 'imgBuild', 'fontsBuild']);

//gulp.task('final');
// git push
// gulp.task('push', ['init', 'add', 'commit'], function(){
//   git.push('origin', 'master', function (err) {
//     if (err) throw err;
//   });
// });

// gulp.task('add', function(){
//   return gulp.src('**/*')
//     .pipe(git.add());
// });
gulp.task('commit', function(){
  return gulp.src('**/*')
    .pipe(git.commit('first commit'));
});
gulp.task('git_remote', function(){
  git.addRemote('origin', 'https://github.com/Vania-woolf/test-project.git', function (err) {
    if (err) throw err;
  });
});
// gulp.task('push', function(){
//   git.push('origin', function (err) {
//     if (err) throw err;
//   });
// });
// gulp.task('git', ['init', 'add', 'commit', 'push']);
gulp.task('ignore', function () {
    return gulp.src('src/**/*')
        .pipe(gitignore())
        .pipe(gulp.dest('build'));
});
gulp.task('init', function(){
  git.init(function (err) {
    if (err) throw err;
  });
});
gulp.task('add', function(){
  return gulp.src('./**/*')
    .pipe(git.add());
});