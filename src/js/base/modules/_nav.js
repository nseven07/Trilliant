export default class Nav {
  constructor() {
    this.navigation = null;
    this.firstContent = null;
    this.scrollTop = null;
    this.navigation = document.getElementById('nav');
    this.firstContent = this.navigation.nextElementSibling;

    this.toggleScrollClasses();
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    this.toggleScrollClasses();
  }

  toggleScrollClasses() {
    let scrollTop = window.scrollY;

    if (window.scrollY === undefined) {
      scrollTop = window.pageYOffset;
    }

    if (scrollTop > 0) {
      document.body.classList.add('scrolled');
      setTimeout(() => {
        if (window.scrollY <= 0) {
          return false;
        }
        return document.body.classList.add('nav-active');
      }, 100);
    } else {
      document.body.classList.remove('nav-active');
      document.body.classList.remove('scrolled');
    }
  }
}
