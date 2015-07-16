'user strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');

// post css
var postcss = require('gulp-postcss');
var mqpacker = require('css-mqpacker');
var csswring = require('csswring');
var cssnext = require('cssnext');
var nested = require('postcss-nested');

// Static Server + file watcher
gulp.task('serve', ['css'], function() {
	browserSync.init({
		server: './'
	});

	gulp.watch('./app/gfx/css/**/*.css', ['css']);
	gulp.watch('./app/**/*.html').on('change', browserSync.reload);
	//gulp.watch('./proto_engine/**.js').on('change', browserSync.reload);
});

gulp.task('css', function () {
	var processors = [
		mqpacker,
		csswring,
		cssnext(),
		nested
	];
	return gulp.src('./app/gfx/css/*.css')
		.pipe(sourcemaps.init())
		.pipe(postcss(processors))
		.on('error', function (err) {
			console.error('Error!', err.message);
			this.emit('end');
		})
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./app/gen'))
		.pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('default', ['serve']);