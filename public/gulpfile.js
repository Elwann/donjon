var root = './';

// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var less         = require('gulp-less');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var rename       = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var minifyCss    = require('gulp-clean-css');
var sourcemaps   = require('gulp-sourcemaps');
var browserSync  = require('browser-sync').create();

function handleError(err){
	console.log(err.toString());
    this.emit('end');
}

// Compile Our less

gulp.task('less', function() {
	return gulp.src(root+'app/style/*.less')
		.pipe(sourcemaps.init())
		.pipe(less()).on('error', handleError)
		.pipe(autoprefixer({
			browsers: ['> 3%', 'last 5 version', 'ie 8-11']
		})).on('error', handleError)
		.pipe(minifyCss({compatibility: 'ie8'})).on('error', handleError)
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(root+'app/style'))
		.pipe(browserSync.stream());
});

// Concatenate & Minify JS

gulp.task('scripts', function() {
	return gulp.src([root+'app/src/*.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('all.js')).on('error', handleError)
		.pipe(gulp.dest(root+'app/'))
		.pipe(rename('all.min.js')).on('error', handleError)
		.pipe(uglify()).on('error', handleError)
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(root+'app/'))
		.pipe(browserSync.stream());
});

// Watch Files For Changes

gulp.task('watch', function() {
	browserSync.init({
		server : {
			baseDir: root
		}
	});

	gulp.watch(root+'app/style/*.less', gulp.series('less'));
	gulp.watch([root+'app/src/*.js'], gulp.series('scripts'));
	gulp.watch(['*.html']).on('change', browserSync.reload);
});
