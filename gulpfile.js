'user strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var rootPath = './app/';
var gfxPath = rootPath + 'gfx/';

// Static Server + file watcher
gulp.task('serve', ['sass'], function() {
	browserSync.init({
		server: "./"
	});

	gulp.watch(gfxPath + 'scss/*.scss', ['sass']);
	gulp.watch('./app/**/*.html').on('change', browserSync.reload);
	gulp.watch('./proto_engine/**.js').on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
	return gulp.src(gfxPath + 'scss/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer('last 2 version'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(gfxPath + 'css/'))
		.pipe(browserSync.stream());
});

gulp.task('default', ['serve']);