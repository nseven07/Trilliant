export default class ContentAnimations {
  constructor(delegate = null, hasAnimateBack = false) {
    this.contents = null;
    this.innerWindowHeight = 0;
    this.firstContentPos = 0;
    this.activeContentIndex = -1;
    this.limits = [];
    this.hasAnimateBack = false;
    this.delegate = null;

    this.contents = Array.prototype.slice.call(document.body.querySelectorAll('section'));
    this.delegate = delegate;
    this.hasAnimateBack = hasAnimateBack;
    this.getLimits();
    window.addEventListener('resize', this.getLimits.bind(this));
    window.addEventListener('scroll', this.checkScroll.bind(this));
    setTimeout(this.onLoad.bind(this), 700);
  }

  getLimits() {
    this.limits = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const content of this.contents) {
      this.limits.push(content.offsetTop);
    }
  }

  onLoad() {
    this.innerWindowHeight = window.innerHeight;
    this.firstContentPos = this.contents[0].offsetTop;

    if (this.innerWindowHeight > this.firstContentPos) {
      this.activeContentIndex += 1;
      this.animateOnLoad();
    }

    this.checkScroll();

    const onStartItems = document.body.querySelectorAll('[data-on-animate-start="true"]');
    const items = Array.prototype.slice.call(onStartItems);

    for (const item of items) {
      item.setAttribute('data-animated', true);
    }
  }

  checkScroll() {
    for (let i = 0; i < this.limits.length; i += 1) {
      const limit = this.limits[i];
      let scrollTop = window.scrollY;

      if (scrollTop === undefined) {
        scrollTop = window.pageYOffset;
      }

      if ((scrollTop + ((this.innerWindowHeight / 8) * 5)) >= limit) {
        this.activeContentIndex = i;
        this.animateContent();
      }
    }

    if (this.hasAnimateBack) {
      this.animateBackContents();
    }
  }

  animateOnLoad() {
    for (let i = 0; i <= this.activeContentIndex; i += 1) {
      this.activeContentIndex = i;
      this.animateContent();
    }
  }

  animateContent() {
    if (this.contents[this.activeContentIndex].hasAttribute('data-animated')) {
      this.contents[this.activeContentIndex].setAttribute('data-animated', true);
    }

    const items = this.contents[this.activeContentIndex].querySelectorAll('[data-animated="false"]');
    const itemsArr = Array.prototype.slice.call(items);

    // eslint-disable-next-line no-restricted-syntax
    for (const item of itemsArr) {
      item.setAttribute('data-animated', true);
      const callback = item.getAttribute('data-animate-callback');
      if (item.getAttribute('data-animate-callback')) {
        this.runCallback(item, callback);
      }
    }

    this.getLimits();
  }

  runCallback(item, callback) {
    if (typeof window[callback] === 'function') {
      new window[callback](item);
    }
  }

  animateBackContents() {
    for (let i = 0; i < this.limits.length; i += 1) {
      if (i > this.activeContentIndex) {
        this.animateBack(i);
      }
    }
  }

  animateBack(index) {
    if (this.contents[index].hasAttribute('data-animated')) {
      this.contents[index].setAttribute('data-animated', false);
    }

    const items = this.contents[index].querySelectorAll('[data-animated="true"]');
    const itemsArr = Array.prototype.slice.call(items);

    for (const item of itemsArr) {
      item.setAttribute('data-animated', false);
    }

    this.getLimits();
  }
}
