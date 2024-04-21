'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const minify = require('gulp-minify')

function buildStyles() {
	return gulp
		.src('./styles/style.scss')
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('./dist/css/'))
}

function buildScripts() {
	return gulp
		.src('./scripts/index.js')
		.pipe(rename({ basename: 'script' }))
		.pipe(
			minify({
				ext: {
					min: '.min.js',
				},
				noSource: true,
			})
		)
		.pipe(gulp.dest('./dist/js'))
}

exports.buildStyles = buildStyles
exports.default = gulp.parallel(buildStyles, buildScripts)
exports.watch = function () {
	gulp.watch('./styles/**/*.scss', gulp.series(buildStyles))
	gulp.watch('./scripts/**/*.js', gulp.series(buildScripts))
}
