# gulp安装及配置

## gulp安装

	安装gulp，我一般会选择局部安装
	cmd窗口，cd到你的项目路径，然后键入以下代码

	···
		npm install gulp --save-dev
	···

## 选择gulp组件
	前端项目需要的功能：
	1、图片（压缩图片支持jpg、png、gif）
	2、样式 （支持sass 同时支持合并、压缩、重命名）
	3、javascript （检查、合并、压缩、重命名）
	4、html （压缩）
	5、客户端同步刷新显示修改
	6、构建项目前清除发布环境下的文件（保持发布环境的清洁）

	通过gulp plugins，寻找对于的gulp组件

	browser-sync: 静态文件服务器，同时也支持浏览器自动刷新
	gulp-autoprefixer: 补全浏览器兼容的css
	gulp-clean: 清空文件夹
	gulp-concat: 合并文件
	gulp-csslint: 检查css
	gulp-eslint: 检查js
	gulp-htmlhint: 检查html
	gulp-imagemin: 压缩图片
	gulp-minify-css: 压缩css
	gulp-rename: 重命名文件
	gulp-rev-easy: 添加版本号
	gulp-ruby-sass: 支持sass
	gulp-sourcemaps: 处理JS时，生成SourceMap
	gulp-uglify: 压缩js
	run-sequence: 让gulp任务，可以相互独立，解除任务间的依赖，增强task复用
	gulp-htmlmin: 压缩html

##	安装gulp组件

	安装组件项目目录，通过cd project 进入目录，执行下边的npm安装组件。

	···
		npm install browser-sync gulp-autoprefixer gulp-clean gulp-concat gulp-csslint gulp-eslint gulp-htmlhint gulp-imagemin gulp-minify-css gulp-rename gulp-rev-easy gulp-ruby-sass gulp-sourcemaps gulp-uglify gulp-util run-sequence --save-dev
	···

##	项目目录结构

	project(项目名称)
	|–.git 通过git管理项目会生成这个文件夹
	|–node_modules 组件目录
	|–dist 发布环境
	    |–css 样式文件(style.css style.min.css)
	    |–images 图片文件(压缩图片)
	    |–js js文件(main.js main.min.js)
	    |–index.html 静态文件(压缩html)
	|–src 生产环境
	    |–sass sass文件
	    |–images 图片文件
	    |–js js文件
	    |–index.html 静态文件
	|–.jshintrc jshint配置文件
	|–gulpfile.js gulp任务文件

##	编写gulp任务
	···
	// 引入 gulp及组件
	var gulp = require('gulp'), //基础库
	    imagemin = require('gulp-imagemin'), //图片压缩
	    sass = require('gulp-ruby-sass'), //sass预处理维css
	    autoprefixer = require('gulp-autoprefixer'),
	    sourcemaps = require('gulp-sourcemaps'),    //处理JS时，生成SourceMap
	    minifycss = require('gulp-minify-css'), //css压缩
	    htmlhint = require('gulp-htmlhint'),    //html检查
	    csslint = require('gulp-csslint'),
	    eslint = require('gulp-eslint');    //js检查
	    uglify = require('gulp-uglify'), //js压缩
	    rename = require('gulp-rename'), //重命名
	    concat = require('gulp-concat'), //合并文件
	    clean = require('gulp-clean'), //清空文件夹
	    reveasy = require('gulp-rev-easy'),
	    runSequence = require('run-sequence'),  //顺序执行任务
	    browserSync = require('browser-sync');  //静态文件服务器，同时也支持浏览器自动刷新

	// HTML处理
	gulp.task('html', function() {
	    var htmlSrc = './src/*.html',
	        htmlDst = './dist/';

	    gulp.src(htmlSrc)
	        .pipe(htmlhint())
	        .pipe(htmlhint.failReporter())
	        .pipe(gulp.dest(htmlDst))
	        .pipe(reveasy()) //加上版本号
	        .pipe(gulp.dest(htmlDst))
	});

	// 样式处理
	gulp.task('css', function() {
	    var cssSrc = './src/scss/*.scss',
	        cssDst = './dist/css';

	    return sass(cssSrc,{style:'expanded',sourcemap:true})
	            .on('error', sass.logError)
	            .pipe(autoprefixer({
	                browsers: ['> 1%', 'IE 8'],
	                cascade: false
	            }))
	            .pipe(csslint())
	            .pipe(csslint.reporter())
	            .pipe(sourcemaps.write())
	            .pipe(sourcemaps.write('maps', {
	                includeContent: false,
	                sourceRoot: './src/scss'
	            }))
	            .pipe(gulp.dest(cssDst))
	            .pipe(rename({suffix: '.min'}))
	            .pipe(minifycss())
	            .pipe(gulp.dest(cssDst));
	});

	// 图片处理
	gulp.task('images', function() {
	    var imgSrc = './src/images/**/*',
	        imgDst = './dist/images';
	    gulp.src(imgSrc)
	        .pipe(imagemin())
	        .pipe(gulp.dest(imgDst));
	})

	// js处理
	gulp.task('js', function() {
	    var mainSrc = './src/js/main.js',
	        mainDst = './dist/js/',
	        appSrc = './src/js/vendor/*.js',
	        appDst = './dist/js/vendor/';

	    gulp.src(mainSrc)
	        //.pipe(concat('main.js'))
	        //.pipe(gulp.dest(jsDst))
	        //.pipe(rename({ suffix: '.min' }))
	        .pipe(eslint())
	        .pipe(eslint.format())
	        .pipe(eslint.failAfterError())
	        .pipe(uglify())
	        .pipe(concat("main.js"))
	        .pipe(gulp.dest(mainDst));

	    gulp.src(appSrc)
	        .pipe(uglify())
	        //.pipe(concat("vendor.js"))
	        .pipe(gulp.dest(appDst));
	});

	// 入口点
	gulp.task('default', function(){
	    runSequence(
	        ['clean'],
	        ['copy'],
	        ['server']
	    );
	});

	// 清空图片、样式、js
	gulp.task('clean', function() {
	    gulp.src(['./dist/css', './dist/js/main.js', './dist/js/vendor', './dist/images'], { read: false })
	        .pipe(clean());
	});

	// 重建图片、样式、js
	gulp.task('copy', function() {
	    gulp.start('html', 'css', 'images', 'js');
	});

	// 监听任务 运行语句 gulp watch
	gulp.task('watch', function() {

	    // 监听html
	    gulp.watch('./src/*.html', function(event) {
	        gulp.run('html');
	    });

	    // 监听css
	    gulp.watch('./src/scss/*.scss', function() {
	        gulp.run('css');
	    });

	    // 监听images
	    gulp.watch('./src/images/**/*', function() {
	        gulp.run('images');
	    });

	    // 监听js
	    gulp.watch(['./src/js/main.js', './src/js/vendor/*.js'], function() {
	        gulp.run('js');
	    });
	});

	// 启动预览服务单独版本
	gulp.task('server', function() {
	    browserSync({
	        notify: true,
	        logPrefix: 'sw',
	        server: 'dist'
	    });
	    gulp.watch('watch');
	    gulp.watch(['dist/**/*'], browserSync.reload);
	});
	···

##	访问

	进入项目路径，然后输入，即可访问localhost:8080

	```
		gulp default
	```
