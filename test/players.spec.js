/* eslint-disable func-names */
const assert = require('assert');
const { stub } = require('sinon');
const jsdom = require('jsdom');
const playerOutput = require('./mockData/giannisData');
const puppetOutput = require('./mockData/samplePage');
const plyr = require('../src/players/player');

const { JSDOM } = jsdom;
const { get, Player } = plyr;

describe('A puppet returning a Document Object', () => {
  beforeEach(() => {
    // @ts-ignore
    stub(Player.prototype, 'getPlayerDocument').callsFake(() => new Promise((resolve) => {
      const dom = new JSDOM(puppetOutput);
      const { window } = dom;
      const { document } = window;
      return resolve(document);
    }));

    stub(Player.prototype, '_findPlayer').callsFake(() => new Promise((resolve) => {
      const dom = new JSDOM(puppetOutput);
      const { window } = dom;
      const { document } = window;
      return resolve(document);
    }));
  });

  it('returns an object with a bio and per-game stats', async () => {
    const query = 'Antetokounmpo, Giannis';
    const output = await get(query);
    const expectedOutput = {
      bio: playerOutput.bio,
      contract: null,
      per_game: playerOutput.per_game,
    };
    assert.equal(JSON.stringify(output), JSON.stringify(expectedOutput));
  });
});
