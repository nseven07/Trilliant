import { task, dest, parallel, series, watch, src } from 'gulp';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import uglify from 'gulp-uglify-es';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import merge from 'merge-stream';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import rename from 'gulp-rename';
import sassVariables from 'gulp-sass-variables';
import { argv } from 'yargs';
import header from 'gulp-header';
import glob from 'glob';
import path from 'path';
import mocha from 'gulp-mocha';
import destination from './destination';
const gSass = require('gulp-sass')(require('node-sass'));

// BrowserSync
const browserSync = require('browser-sync').create();

// defaults
const defPort = 3000;

export const sass = task('sass', () => {
  const files = glob.sync(destination.sourceSass);
  return merge(files.map((file) => (
      src(file)
        .pipe(sassVariables({
          $env: 'development'
        }))
        .pipe(sourcemaps.init())
        .pipe(gSass())
        .on('error', gSass.logError)
        .pipe(rename(`${path.basename(file, 'scss').toLowerCase()}css`))
        .pipe(sourcemaps.write())
        .pipe(dest(destination.css))
        .pipe(browserSync.stream())
    )));
});

export const js = task('js', () => {
  let port = defPort;

  if (argv.port) {
    port = argv.port;
  }

  const files = glob.sync(destination.sourceJs);
  return merge(files.map((file) => browserify({ entries: file, debug: true })
      .transform('babelify', { presets: ['es2015'] })
      .bundle()
      .pipe(source(path.basename(file).toLowerCase()))
      .pipe(header('let NODE_ENV = \'development\';'))
      .pipe(header(`let PORT = ${port};`))
      .pipe(buffer())
      .pipe(dest(destination.js))
      .pipe(browserSync.stream())));
});

export const prodSass = task('prodSass', () => {
  const files = glob.sync(destination.sourceSass);
  return merge(files.map((file) => (
      src(file)
        .pipe(sassVariables({
          $env: 'production'
        }))
        .pipe(sourcemaps.init())
        .pipe(gSass())
        .on('error', gSass.logError)
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename(`${path.basename(file, '.scss').toLowerCase()}.min.css`))
        .pipe(sourcemaps.write())
        .pipe(dest(destination.prodCss))
    )));
});

export const prodJs = task('prodJs', () => {
  const files = glob.sync(destination.sourceJs);
  return merge(files.map((file) => browserify({ entries: file, debug: true })
      .transform('babelify', { presets: ['es2015'] })
      .bundle()
      .pipe(source(`${path.basename(file, '.js').toLowerCase()}.min.js`))
      .pipe(header('let NODE_ENV = \'production\';'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('./maps'))
      .pipe(dest(destination.prodJs))));
});

const reload = done => {
  browserSync.reload();
  done();
};

const server = () => {
  browserSync.init({
    server: {
      baseDir: destination.dist
    },
    notify: false,
  });
};

export const image = task('image', () => (
  src(destination.sourceImg).pipe(dest(destination.image))
));


export const test = task('test', done => {
  src(destination.test, {read: false})
  .pipe(mocha({
    reporter: 'list'
  }))
  done();
})

export const dev = task('dev', () => {
  watch(destination.privateJs, series('js'));
  watch(destination.sourceSass, series('sass'));
  watch(destination.sourceImg, series('image'));
  server();
  watch(destination.html, reload);
});

export const prod = task('prod', parallel('prodJs', 'prodSass'));
