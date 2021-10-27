export default class Env {
  constructor() {
    if (window.NODE_ENV && window.NODE_ENV === 'development') { this.development(); } else { this.production(); }
  }

  development() {
    return console.log('enviropments === development');
  }

  production() {
    return console.log('enviropments === production');
  }
}
