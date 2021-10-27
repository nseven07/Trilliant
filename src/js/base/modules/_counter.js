export default class Counter {
  constructor(container) {
    this.container = null;
    this.counters = [];
    this.container = container;
    this.enableCounters();
  }

  enableCounters() {
    this.counters = Array.prototype.slice.call(this.container.querySelectorAll('*[data-count]'));

    for (const counter of this.counters) {
      const count = parseInt(counter.getAttribute('data-count'), 10);
      let perCount = parseInt(counter.getAttribute('data-per-count'), 10);
      perCount = isNaN(perCount) ? 1 : perCount;
      this.startCounter(counter, count, perCount);
    }
  }

  startCounter(elem, count, perCount) {
    let i = 0;
    const timer = 1500 / (count / perCount);
    const diff = count % perCount;
    const element = elem;

    const interval = setInterval(() => {
      if (i < count) {
        i += perCount;
        if (i > count) i = (i - perCount) + diff;

        let innerTxt = i;

        const comma = elem.getAttribute('data-comma');
        if (comma) {
          innerTxt = this.numberWithCommas(i, comma);
        }

        element.innerHTML = innerTxt;
      } else {
        clearInterval(interval);
      }
    }, timer);
  }

  numberWithCommas(number, comma) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, comma);
  }
}
