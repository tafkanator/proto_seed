'user strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');

// post css
var postcss = require('gulp-postcss');
var mqpacker = require('css-mqpacker');
var cssnext = require('cssnext');
var precss = require('precss');
var grid = require('postcss-grid');

// Static Server + file watcher
gulp.task('serve', ['css'], function() {
	browserSync.init({
		server: './'
	});

	gulp.watch('./app/gfx/css/**/*.css', ['css']);
	gulp.watch('./app/gfx/css/**/*.scss', ['css']);
	gulp.watch('./app/**/*.html').on('change', browserSync.reload);
	//gulp.watch('./proto_engine/**.js').on('change', browserSync.reload);
});

gulp.task('css', function () {
	var processors = [
		mqpacker,
		grid({
			columns: 12,
			maxWidth: 960,
			gutter: 10
		}),
		precss(),
		cssnext()
	];
	return gulp.src('./app/gfx/css/main.css')
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