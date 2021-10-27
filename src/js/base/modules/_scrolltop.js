export default class ScrollTop {
  constructor() {
    this.button = null;
    this.windowWidth = 0;
    this.bodyHeight = 0;
    this.containerWidth = 0;
    this.footerHeight = 0;

    this.button = document.getElementById('scroll-top-button');

    if( !this.button ) return false;

    this.buildButton();
  
    this.button.addEventListener('click', this.scrollToTop.bind(this));
    window.addEventListener('resize', this.buildButton.bind(this));
  }

  scrollToTop() {
    let scrollTop = window.scrollY;

    if (scrollTop === undefined) {
      scrollTop = window.pageYOffset;
    }

    const scrollStep = Math.PI / (800 / 15);
    const cosParameter = scrollTop / 2;

    let scrollCount = 0;
    let scrollMargin;
    const scrollInterval = setInterval(() => {
      // eslint-disable-next-line no-shadow
      let scrollTop = window.scrollY;

      if (scrollTop === undefined) {
        scrollTop = window.pageYOffset;
      }

      if (scrollTop !== 0) {
        scrollCount += 1;
        scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
        window.scrollTo(0, (scrollTop - scrollMargin));
      } else clearInterval(scrollInterval);
    }, 15);
  }

  buildButton() {
    const container = document.getElementsByClassName('container')[0];
    const footer = document.getElementsByTagName('footer')[0];

    this.windowWidth = window.innerWidth;
    this.bodyHeight = document.body.clientHeight;
    this.containerWidth = container.clientWidth;
    this.footerHeight = footer.clientHeight;

    this.button.style.right = `${((this.windowWidth - this.containerWidth) / 2) + 15}px`;

    const limit = footer.offsetTop - window.innerHeight;

    let scrollTop = window.scrollY;

    if (scrollTop === undefined) {
      scrollTop = window.pageYOffset;
    }

    if (scrollTop >= limit) {
      this.button.style.bottom = `${(scrollTop - limit) + 32}px`;
    } else {
      this.button.style.bottom = '32px';
    }
  }

  toggleButton(isActive) {
    this.buildButton();

    if (isActive) {
      this.button.classList.add('active');
    } else {
      this.button.classList.remove('active');
    }
  }
}
