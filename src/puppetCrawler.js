const jsdom = require('jsdom');
const puppeteer = require('puppeteer');
const fs = require('fs');

const { JSDOM } = jsdom;

class Puppet {
  get() {
    this.htmlString = '';
    this.url = '';
  }

  /**
   * @param {string} url
   */
  constructor(url) {
    this.url = url;
  }

  /**
   * @param {string} str
   */
  setHTMLString(str) {
    this.htmlString = str;
    return undefined;
  }

  // I can stub this now
  async getHTMLFromChrome() {
    const init = await puppeteer.launch();
    const puppet = await init.newPage();

    await puppet.goto(this.url);
    const htmlString = await puppet.content();
    fs.writeFileSync('player.html', htmlString, 'utf8');
    // Return nothing
    return this.setHTMLString(htmlString);
  }

  createWindow() {
    const dom = new JSDOM(this.htmlString);
    const { window } = dom;
    const { document } = window;

    return document;
  }

  async getPage() {
    try {
      await this.getHTMLFromChrome();
      const document = this.createWindow();
      return document;
    } catch (error) {
      throw new Error('fml');
    }
  }
}

module.exports = Puppet;
