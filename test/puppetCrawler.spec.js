/* eslint-disable func-names */
const assert = require('assert');
const { stub } = require('sinon');
const puppetOutput = require('./mockData/samplePage');
const Puppet = require('../src/puppetCrawler');


describe('A puppet returning a Document Object', () => {
  beforeEach(() => {
    // @ts-ignore
    stub(Puppet.prototype, 'getHTMLFromChrome').callsFake(function () {
      this.htmlString = puppetOutput;
      return new Promise((resolve) => {
        resolve(undefined);
      });
    });
  });

  it('returns a document with JavaScript rendered elements', async () => {
    const puppet = new Puppet('http://fake-address.com');
    const document = await puppet.getPage();
    const rootDiv = document.querySelector('#advanced').textContent;
    const expectedTitle = 'Advanced Table';
    const includesExpectedTitle = rootDiv.includes(expectedTitle);
    assert.equal(includesExpectedTitle, true);
  });
});
