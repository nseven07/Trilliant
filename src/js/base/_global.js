/* eslint-disable no-unused-vars */
// Packages Imports
import 'core-js/es6/symbol';
import 'core-js/fn/symbol/iterator';
import jQuery from 'jquery';
import Bootstrap from 'bootstrap';

// Modules Import
import Nav from './modules/_nav';
import Scrolltop from './modules/_scrolltop';
import ContentAnimations from './modules/_content-animation';
import Env from './_env';

// Window Globally definations
// eslint-disable-next-line no-multi-assign
window.$ = window.jQuery = jQuery;

export default class Global {
  constructor() {
    new Env();
    new Nav();
    new Scrolltop();
    new ContentAnimations(null,true);
  }
}
