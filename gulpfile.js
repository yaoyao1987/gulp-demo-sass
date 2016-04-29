/*
 * @Author: ly.yao
 * @Date:   2016-04-26 11:31:21
 * @Last Modified by:   ly.yao
 * @Last Modified time: 2016-04-29 10:24:41
 */

// 引入 gulp及组件
var gulp = require('gulp'), //基础库
    imagemin = require('gulp-imagemin'), //图片压缩
    sass = require('gulp-ruby-sass'), //sass预处理维css
    autoprefixer = require('gulp-autoprefixer'), //自动补全前缀
    sourcemaps = require('gulp-sourcemaps'), //处理JS时，生成SourceMap
    minifycss = require('gulp-minify-css'), //css压缩
    htmlhint = require('gulp-htmlhint'), //html检查
    csslint = require('gulp-csslint'), //css检查
    eslint = require('gulp-eslint'), //js检查
    uglify = require('gulp-uglify'), //js压缩
    htmlmin = require('gulp-htmlmin'), //压缩html
    rename = require('gulp-rename'), //重命名
    concat = require('gulp-concat'), //合并文件
    clean = require('gulp-clean'), //清空文件夹
    reveasy = require('gulp-rev-easy'), //添加版本号
    runSequence = require('run-sequence'), //顺序执行任务
    browserSync = require('browser-sync'); //静态文件服务器，同时也支持浏览器自动刷新

// HTML处理
gulp.task('html', function() {
    var htmlSrc = './src/*.html',
        htmlDst = './dist/';

    gulp.src(htmlSrc)
        .pipe(htmlhint())
        .pipe(htmlhint.failReporter())
        .pipe(gulp.dest(htmlDst))
        .pipe(reveasy()) //加上版本号
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(htmlDst))
});

// 样式处理
gulp.task('css', function() {
    var cssSrc = './src/scss/*.scss',
        cssDst = './dist/css';

    return sass(cssSrc, { style: 'expanded', sourcemap: true })
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
        .pipe(rename({ suffix: '.min' }))
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
        // .pipe(eslint.failAfterError())
        .pipe(uglify())
        .pipe(concat("main.js"))
        .pipe(gulp.dest(mainDst));

    gulp.src(appSrc)
        .pipe(uglify())
        //.pipe(concat("vendor.js"))
        .pipe(gulp.dest(appDst));
});

// 入口点
gulp.task('default', function() {
    runSequence(
        ['clean'], ['copy'], ['server']
    );
});

// 清空图片、样式、js
gulp.task('clean', function() {
    gulp.src(['./dist/css', './dist/js/main.js', './dist/js/vendor', './dist/images'], { read: false })
        .pipe(clean());
});

// 重建图片、样式、js
gulp.task('copy', function() {
    // gulp.start('css', 'js', 'images', 'html');
    runSequence(
        ['css'],['js'], ['html']
    );
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
    gulp.watch(['dist/**/*'], browserSync.reload);
});
