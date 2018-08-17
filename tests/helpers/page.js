const puppeteer = require('puppeteer');
const userFactory = require('../factories/userFactory');
const sessionFactory = require('../factories/sessionFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page, browser);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || page[property] || browser[property];
      }
    });
  }

  constructor(page, browser) {
    this.page = page;
    this.browser = browser;
  }

  async login() {
    this.user = await userFactory.createUser();
    const { session, sig } = sessionFactory(this.user);
    const url = this.page.url();

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto(url);
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async close() {
    if (this.user) {
      await userFactory.deleteUser(this.user);
    }
    await this.browser.close();
  }
}

module.exports = CustomPage;
