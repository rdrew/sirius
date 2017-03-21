var gulp = require("gulp"),
	sass = require("gulp-sass"),
	browserSync = require("browser-sync").create(),
	runSequence = require("run-sequence"),
	del = require("del"),
	glob = require("glob"),
	autoprefixer = require("gulp-autoprefixer"),
	importer = require('node-sass-globbing'),
	sourcemaps = require('gulp-sourcemaps'),
	imagemin = require('gulp-imagemin'),
	sassLint = require('gulp-sass-lint'),
	neat = require('bourbon-neat').includePaths,
	bourbon = require('bourbon').includePaths,
	//added these for the uncss task
	uncss = require('gulp-uncss'),
	rename = require('gulp-rename');

//############################
//Edit these paths and options
//############################

//name of the drupal theme:
var _themeName = "sirius";

//url of the remote site
var _url = "http://istudies.discoveryspace.ca";

//path to the themes assets (compiled css, js, imgs) dir
var _path = "/themes/sirius/build";

//make sure the 2 Dirs are correct
var config = {
	remoteURL: _url,
	srcDir: "./src",
	injectDir: "./build",
	//localPath: _path,
	//localPath: "/localpath",
	localPath: "/build",

	localAssets: {
		css: [
			"css/**/*.css"
		],
		js: [
			"js/**/*.js"
		]
	}

};

var sass_config = {

	importer: importer,

	includePaths: [
		'node_modules'
		//'node_modules/breakpoint-sass/stylesheets/',
		//'node_modules/singularitygs/stylesheets/',
		//'node_modules/compass-mixins/lib/',
		//'node_modules/bourbon/app/assets/stylesheets/',
		//'node_modules/bourbon-neat/app/assets/stylesheets/'
	]


};

var targetCss = _themeName + ".styles.css";

// ##################
// Clean Task
// ##################

gulp.task("clean", function() {
	return del.sync(config.injectDir);
});

// ##################
// Sass Development Task
// ##################

gulp.task("sass_dev", function() {
	//this gets stuff in subfolders also and i dont want that atm
	////return gulp.src(config.srcDir + "/styles/scss/**/*.scss")
	return gulp.src(config.srcDir + "/styles/scss/*.scss")
		.pipe(sourcemaps.init())
		.pipe(sass(sass_config).on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(config.injectDir + "/css"))
		.pipe(browserSync.stream());
});

// ##################
// Sass Production Task
// ##################

gulp.task("sass_prod", function() {
	//this gets stuff in subfolders also and i dont want that atm
	////return gulp.src(config.srcDir + "/styles/scss/**/*.scss")
	return gulp.src(config.srcDir + "/styles/scss/*.scss")
		.pipe(sourcemaps.init())
		.pipe(sass(sass_config).on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(config.injectDir + "/css"))
		.pipe(browserSync.stream());
});

// ##################
// Images Task
// ##################

gulp.task('images', function() {
	return gulp.src(config.srcDir + '/img/**/*')
	//pipe through image_min
		.pipe(imagemin())
		.pipe(gulp.dest(config.injectDir + '/img'))
});


// ##################
// JS Task
// ##################

gulp.task("js", function() {
	return gulp.src(config.srcDir + "/js/**/*.js")
		.pipe(gulp.dest(config.injectDir + "/js"))
		.pipe(browserSync.stream());
});


// ##################
// Browsersync Task
// ##################

gulp.task("browserSync", ["sass_dev", "js"], function() {

	//RegExp for finding and removing main css file rather that just override
	//var _regex = new RegExp("@import.*" + _path + ".*;", "g");
	//var _regex = new RegExp("<link.*\/" + _themeName + "\/css\/.*", "g");
	var _regex = new RegExp("@import.*\/" + _themeName + "\/build\/css.*", "g");

	browserSync.init({
		proxy: {
			target: config.remoteURL
		},
		open: false,
		rewriteRules: [
			{
				match: _regex,
				fn: function (req, res, match) {
					return '';
				}
			},

			{
				// Inject Local CSS at the end of HEAD
				match: /<\/head>/i,
				fn: function(req, res, match) {
					var localCssAssets = "";
					for (var i = 0; i < config.localAssets.css.length; i++) {

						var files = glob.sync(config.localAssets.css[i], {
							cwd: config.injectDir
						});

						for (var file in files) {
							localCssAssets += "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + config.localPath + "/" + files[file] + "\">";
						}
					}

					return localCssAssets + match;
				}
			}, {
				// Inject Local JS at the end of BODY
				match: /<\/body>/i,
				fn: function(req, res, match) {
					var localJsAssets = "";
					for (var i = 0; i < config.localAssets.js.length; i++) {

						var files = glob.sync(config.localAssets.js[i], {
							cwd: config.injectDir
						});

						for (var file in files) {
							localJsAssets += "<script src=\"" + config.localPath + "/" + files[file] + "\"></script>";
						}
					}

					return localJsAssets + match;
				}
			}],
		serveStatic: [{
			route: config.localPath,
			dir: config.injectDir
		}],
		watchTask: true
	});
});


// ##################
// uncss Task
// ##################


gulp.task('uncss', function() {
  //Where the bloated CSS lives
  return gulp.src([
    
    'build/css/styles.css' 

  ]) 
    .pipe(uncss({ 
      html: [

        'http://istudies.discoveryspace.ca/',
        'http://istudies.discoveryspace.ca/node/479'

      ]
    }))  
  //Add a suffix to avoid confusion      
    .pipe(rename({suffix: '.clean'}))
  //The destination of new uncssed file
    .pipe(gulp.dest('build/clean_css')); 
});





	// ##################
	// Watch Task
	// ##################

	gulp.task("watch", ["browserSync", "js", "images", "sass_dev"], function() {
		gulp.watch(config.srcDir + "/styles/scss/**/*.scss", ["sass_dev"]);
		gulp.watch(config.srcDir + "/img/**/*", ["images"]);
		gulp.watch(config.srcDir + "/js/**/*.js", ["js"]);
	});

	// ##################
	// Build Task
	// ##################

	gulp.task("build", function() {
		runSequence([
			"clean",
			"sass_dev",
			"js",
			"images"
		]);
	});

	// ##################
	// Default Task
	// ##################

	gulp.task("default", function() {
		runSequence(["build", "browserSync", "watch"]);
	});
