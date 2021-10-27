/* eslint-disable no-prototype-builtins */
import Env from '../_env';

export default class Form {
  constructor(formId, delegate, hasValidate = true, redirectUrl = null, hasToken = null, additionalData = null, hasCapthca = false, recaptchaId = 'g-recaptcha') {
    this.captchaInited = false;
    this.formId = formId;
    this.additionalData = additionalData;
    this.delegate = delegate;
    this.hasToken = hasToken;
    this.redirectUrl = redirectUrl;
    this.form = document.getElementById(formId);
    this.url = this.form.getAttribute('action');
    this.names = [];
    this.data = {};
    this.hasValidate = hasValidate;
    this.hasCapthca = hasCapthca;
    this.recaptchaId = recaptchaId;
    this.grecaptcha = null;
    this.recaptcha = null;
    this.catpchaResponse = '';
    this.isValid = false;
    this.requiredFields = [];
    this.button = document.querySelector(`#${formId} .btn`);
    this.dataCountries = null;
    this.dataCities = null;
    this.hasCountries = false;

    this.buildForm();
  }

  // eslint-disable-next-line consistent-return
  buildForm() {
    if (this.hasCapthca && !this.captchaInited) {
      this.button.setAttribute('disabled', true);
      setTimeout(() => {
        this.buildCaptcha();
      }, 5000);
      return false;
    }

    const elements = this.form.querySelectorAll('.form-control');

    for (const element of elements) {
      const name = element.getAttribute('name');

      if (name === 'country') {
        element.addEventListener('change', this.countryOnChange.bind(this));
        this.getCountries();
      } else if (name === 'city') {
        element.addEventListener('change', this.cityOnChange.bind(this));
        // this.getCities();
      } else {
        element.addEventListener('change', this.onChange.bind(this));
      }
    }

    this.form.addEventListener('submit', this.submitForm.bind(this));
  }

  buildCaptcha() {
    const onLoad = (resolve) => {
      resolve();

      setTimeout(() => {
        this.recaptcha = document.getElementById(this.recaptchaId);

        // eslint-disable-next-line no-undef
        this.grecaptcha = grecaptcha.render(this.recaptcha, {
          sitekey: Env.CAPTCHA_KEY,
          callback: this.checkCaptcha.bind(this),
          hl: window.langSelector
        });

        this.captchaInited = true;
        this.buildForm();
        this.button.removeAttribute('disabled');
      }, 400);
    };

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.onload = onLoad.bind(this, resolve);
      script.src = 'https://www.google.com/recaptcha/api.js';
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }

  onChange() {
    this.validateFields();
  }

  cityOnChange(e) {
    const cityName = e.target.value;
    this.getDistricts(cityName);
  }

  countryOnChange(e) {
    this.activeCountry = e.target.value;
    this.getCities();
  }

  getCountryData(callback = null) {
    fetch(`${Env.CDN.image}countries-clean-min.json`)
      .then((res) => res.json())
      .then((out) => {
        this.dataCountries = out;
        if (callback !== null) callback();
      })
      .catch((err) => { throw err; });
  }

  // eslint-disable-next-line consistent-return
  getCountries() {
    if (this.dataCountries === null) {
      this.getCountryData(this.getCountries.bind(this));
      return false;
    }

    this.countrySelect = this.form.querySelectorAll('select[name="country"]')['0'];
    const countries = [...new Set(this.dataCountries.map((item) => item.n))];

    for (const country of countries) {
      this.countrySelect.appendChild(this.createOption(country, country));
    }
  }

  getCities() {
    this.citySelect = this.form.querySelectorAll('select[name="city"]')['0'];

    this.citySelect.innerHTML = '';
    const opt = this.createOption('', 'Seçiniz');
    this.citySelect.appendChild(opt);

    this.cityData = this.dataCountries.filter(
      (item) => (this.countrySelect.value === item.n ? item : false)
    );

    this.cityData = this.cityData[0].states;

    for (let i = 0; i < this.cityData.length; i += 1) {
      const cityItem = this.cityData[i];
      if (cityItem.n !== undefined) return;
      const cityDataOpt = this.createOption(cityItem.n, cityItem.n);
      this.citySelect.appendChild(cityDataOpt);
    }
  }

  getDistricts(cityName) {
    this.districtSelect = this.form.querySelectorAll('select[name="district"]')['0'];
    this.districtSelect.innerHTML = '';
    this.districtSelect.appendChild(this.createOption('', 'Seçiniz'));

    for (let i = 0; i < this.cityData.length; i += 1) {
      if (cityName === this.cityData[i].n) {
        for (let j = 0; j < this.cityData[i].c.length; j += 1) {
          const relatedDistrict = this.cityData[i].c[j].n;
          const opt = this.createOption(relatedDistrict, relatedDistrict);

          this.districtSelect.appendChild(opt);
        }
      }
    }
  }

  createOption(value, label) {
    const option = document.createElement('option');
    option.innerHTML = label;
    option.value = value;

    return option;
  }

  getFormData() {
    const elements = this.form.querySelectorAll('.form-control');
    const data = {};
    let maskCounter = 0;
    this.isValid = false;
    this.requiredFields = [];

    for (const element of elements) {
      const type = element.getAttribute('type');
      const key = element.getAttribute('name').toString();
      let value = '';

      if (type === 'radio') {
        if (element.checked) {
          value = element.value;
        }
      } else if (type === 'checkbox') {
        if (element.checked) {
          value = true;
        } else {
          value = false;
        }
      } else if (key.includes('phone')) {
        value = this.delegate.maskedElements[maskCounter].unmaskedValue;
        maskCounter += 1;
      } else {
        value = element.value;
      }

      if (element.getAttribute('data-group')) {
        const group = element.getAttribute('data-group');
        if (!data.hasOwnProperty(group)) {
          data[group] = {};
        }
        data[group][key] = value;
      } else {
        data[key] = value;
      }

      const required = element.getAttribute('data-required');

      if (required === 'true' && this.hasValidate) {
        this.requiredFields.push({
          type,
          name: key,
          element,
          isValid: false
        });
      }
    }

    if (this.validateFields() || !this.hasValidate) {
      this.isValid = true;
      return data;
    }
      return {};
  }

  validateFields() {
    let isValid = true;
    let maskedCounter = 0;

    for (const field of this.requiredFields) {
      if (field.type === 'checkbox') {
        field.isValid = field.element.checked;
      } else if (field.name.includes('email')) {
          field.isValid = this.checkMail(field.element.value);
        } else if (field.name.includes('phone')) {
          field.isValid = this.delegate.maskedElements[maskedCounter].unmaskedValue.length > 1;
          maskedCounter += 1;
        } else {
          field.isValid = field.element.value.length > 0;
        }

      if (!field.isValid) {
        field.element.parentNode.classList.add('is-invalid');
      } else {
        field.element.parentNode.classList.remove('is-invalid');
      }

      if (isValid) {
        isValid = field.isValid;
      }
    }

    if (this.hasCapthca) {
      if (this.catpchaResponse.length === 0) {
        isValid = false;
        this.recaptcha.parentNode.classList.add('is-invalid');
      } else {
        this.recaptcha.parentNode.classList.remove('is-invalid');
      }
    }

    return isValid;
  }

  checkCaptcha(response) {
    this.catpchaResponse = response;
  }

  checkMail(value) {
    // eslint-disable-next-line no-useless-escape
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(String(value).toLowerCase());
  }

  submitForm(e) {
    e.stopPropagation();
    e.preventDefault();

    if (this.button) {
      this.button.setAttribute('disabled', true);
    }
    this.data = this.getFormData();

    if (this.data.hasOwnProperty('agreement')) {
      delete this.data.agreement;
    }

    if (this.isValid || !this.hasValidate) {
      if (this.additionalData) {
        this.data[this.delegate.additionalLabel] = [];

        for (const item of this.delegate.additionalData) {
          this.data[this.delegate.additionalLabel].push(item);
        }
      }

      const onLoad = (data) => {
        if (data.isSuccess) {
          this.form.classList.add('success');
          this.delegate.formSubmitted = false;
          if (this.redirectUrl != null) {
            window.location.href = this.redirectUrl;
          }

          if (this.delegate.hasCallback) {
            // eslint-disable-next-line no-param-reassign
            data.formId = this.formId;
            this.delegate.callback(data);
          }

          if (this.button) {
            this.button.removeAttribute('disabled');
          }
        } else {
          this.form.classList.add('error');
        }
      };

      const onError = () => {
        if (this.button) {
          this.button.removeAttribute('disabled');
        }

        this.form.classList.add('error');
      };

      const headers = {};

      if (this.hasToken) {
        headers.authorization = `Bearer ${Env.AUTH.token}`;
      }

      if (this.hasCapthca) {
        this.data['g-Recaptcha-Response'] = this.catpchaResponse;
      }

      const formCall = new ApiCall('register', this.url, JSON.stringify(this.data), headers, false);
      formCall.onLoad = onLoad.bind(this);
      formCall.onError = onError.bind(this);
      formCall.send();
    } else {
      this.button.removeAttribute('disabled');
    }

    return false;
  }

  sendFile(file, name = 'file') {
    // eslint-disable-next-line no-undef
    const url = Env.API_URL[NODE_ENV] + this.url;
    const data = new FormData();
    const onLoad = this.delegate.onLoad.bind(this.delegate);
    data.append(name, this.delegate.fileInput.files[0]);

    const headers = {};

    if (this.hasToken) {
      // eslint-disable-next-line no-undef
      headers.token = currentUser.token;
    }

    const xhr = new XMLHttpRequest();

    xhr.withCredentials = false;

    // eslint-disable-next-line func-names
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        const response = JSON.parse(this.responseText);
        onLoad(response);
      }
    });

    xhr.open('POST', url);

    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, headers[key]);
      }
    }

    xhr.send(data);
  }

  changeForm() {
    const radioButtons = document.getElementsByName('companyType');
    const taxInput = document.getElementById('tax-number');
    const taxLabel = taxInput.parentNode.children[0];
    const taxOfficeInput = document.getElementById('tax-office');

    if (radioButtons[0].checked) {
      taxInput.setAttribute('maxlength', 10);
      taxLabel.innerHTML = 'Vergi No';
      taxOfficeInput.setAttribute('data-required', true);
    } else {
      taxInput.setAttribute('maxlength', 11);
      taxLabel.innerHTML = 'TC. Kimlik No';
      taxOfficeInput.removeAttribute('data-required');
    }
  }

  log() {
    console.log(`${this.name} ${this.method}`);
  }
}
