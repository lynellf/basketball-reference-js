/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const Puppet = require('../puppetCrawler');
const Utils = require('./utils');

const {
  getPlayerPageURL, nameCheck, rowsToArray, trimWhitespace
} = Utils;

/**
 * @class Player
 * @classdesc Everything about a player
 */

class Player {
  /**
   * @param {string} query
   * @param {{ tableIDs: string[]; bio: boolean; contract: boolean; }} options
   */
  constructor(query, options) {
    this.bioString = '';
    this.trimmedBioString = '';
    this.config = {
      baseURL: 'https://www.basketball-reference.com/',
      contractSelector: 'table[id^="contracts_"]',
      playerBioSelector: 'div[itemtype="https://schema.org/Person"]',
      playerListSelector: 'th[data-stat="player"]',
      playerNameSelector: 'h1[itemprop="name"]',
      validTableIDs: [
        'advanced',
        'all_college_stats',
        'all_salaries',
        'all_star',
        'pbp',
        'per_game',
        'per_minute',
        'per_poss',
        'playoffs_advanced',
        'playoffs_pbp',
        'playoffs_per_game',
        'playoffs_per_minute',
        'playoffs_per_poss',
        'playoffs_shooting',
        'playoffs_totals',
        'shooting',
        'sim_career',
        'sim_thru',
        'totals',
        'year-and-career-highs-po',
        'year-and-career-highs'
      ]
    };
    const { tableIDs, bio, contract } = options;
    this.bio = bio || false;
    this.contract = contract || false;
    this.query = query;
    this.tableIDs = tableIDs
      ? this._playerStatTableToObject(tableIDs)
      : ['per_game'];
  }

  /**
   * @param {string} query
   */
  async _getPlayerPage(query) {
    this.document = await this._findPlayer(query);
    return undefined;
  }

  /**
   * @param {string[]} tableIDs
   */
  _playerStatTableToObject(tableIDs) {
    const { validTableIDs } = this.config;
    const ids = tableIDs.reduce((output, id) => {
      const matchedID = validTableIDs.find(validID => validID === id);
      const hasMatch = matchedID !== undefined;
      if (!hasMatch) {
        return output;
      }
      return [...output, id];
    }, []);
    return ids;
  }

  /**
   * @param {string} query
   */
  async _findPlayer(query) {
    const { baseURL, playerListSelector } = this.config;
    const hasQuery = query.length > 0;

    if (!hasQuery) {
      throw new Error('Please provide a player name. (Last Name, First Name)');
    }

    const parsedQuery = query.split(',');
    const surname = parsedQuery[0];
    const fullName = parsedQuery.reverse().join(' ');
    const normalizedName = fullName.toLowerCase().trim();
    const firstChar = surname[0].toLowerCase();
    const searchQuery = `${baseURL}/players/${firstChar}`;
    const robot = new Puppet(searchQuery);
    const playerIndex = await robot.getPage();
    const playerList = playerIndex.querySelectorAll(playerListSelector);
    const playerArray = [...playerList];
    const matchedPlayer = playerArray.find(nameCheck(normalizedName));
    const hasMatch = matchedPlayer !== undefined;

    if (!hasMatch) {
      throw new Error('No Player Found');
    }
    const playerPage = await this._getPlayerDocument(matchedPlayer);
    return playerPage;
  }

  /**
   * @param {Element} matchedPlayer
   */
  async _getPlayerDocument(matchedPlayer) {
    const { baseURL } = this.config;
    const { children } = matchedPlayer;
    const firstTag = children[0];
    const tagName = firstTag.tagName.toLowerCase();
    const isActive = tagName === 'strong';
    const endpoint = getPlayerPageURL(isActive, children);
    const playerURL = `${baseURL}${endpoint}`;
    const robot = new Puppet(playerURL);
    const playerPage = await robot.getPage();
    return playerPage;
  }

  _getPlayerBio() {
    const { config, document } = this;
    const { playerBioSelector } = config;
    const bioElement = document.querySelector(playerBioSelector);
    this.bioString = bioElement.textContent;
    this.trimmedBioString = trimWhitespace(this.bioString);
    const accolades = this._getPlayerAccolades();
    const age = this._getPlayerAge();
    const name = this._getPlayerName();
    const birthplace = this._getPlayerBirthplace();
    const highSchool = this._getPlayerHighSchool();
    const college = this._getPlayerCollege();
    const position = this._getPlayerPosition();
    const attributes = this._getPlayerAttributes();
    const nicknames = this._getPlayerNicknames();
    const draft = this._getPlayerDraft();
    const education = { college, highSchool };
    return {
      accolades,
      attributes,
      age,
      birthplace,
      draft,
      education,
      name,
      nicknames,
      position
    };
  }

  /**
   * @param {string} tableID
   * Expected: Return null if requred table element does not exist.
   * Unexpected: Throw exception if table body element does not exist.
   * Unexpected: Throw exception if 'data-stat' attribute does not exist.
   */
  _getPlayerStats(tableID) {
    const { document } = this;

    const table = document.querySelector(`#${tableID}`);
    const hasTable = table !== null;

    if (!hasTable) {
      return null;
    }

    const tableChildren = [...table.children];
    const tableBody = tableChildren.find(node => node.tagName === 'TBODY');
    const hasTableBody = tableBody !== undefined;

    if (!hasTableBody) {
      throw new Error('Table does not have a table body element');
    }

    const tableRows = [...tableBody.children];
    const stats = tableRows.map(rowsToArray);

    return stats;
  }

  _getPlayerContract() {
    const { document, config } = this;
    const { contractSelector } = config;
    const contractTable = document.querySelector(contractSelector);
    const hasContractTable = contractTable !== null;

    if (!hasContractTable) {
      return null;
    }

    const tableChildren = [...contractTable.children];
    const tableBody = tableChildren.find(
      element => element.tagName === 'TBODY'
    );
    const tableHead = tableChildren.find(
      element => element.tagName === 'THEAD'
    );
    const hasTableBody = tableBody !== undefined;
    const hasTableHead = tableHead !== undefined;
    const hasTableContents = hasTableBody && hasTableHead;

    if (!hasTableContents) {
      throw new Error('Table Body does not exist for player contract');
    }

    const headerRow = tableHead.children[0];
    const headerCells = [...headerRow.children];
    const contractKeys = headerCells.map(cell => cell.textContent);
    const bodyRow = tableBody.children[0];
    const bodyRowCells = [...bodyRow.children];
    const results = bodyRowCells.reduce((output, cell, index) => {
      const key = contractKeys[index];
      output[key] = cell.textContent;

      return output;
    }, {});

    return results;
  }

  _getPlayerAccolades() {
    const { document } = this;
    const accoladesList = document.querySelector('#bling');
    const accoladesItems = [...accoladesList.children];
    const accolades = accoladesItems.map(item => item.textContent);

    return accolades;
  }

  _getPlayerName() {
    const { config, document } = this;
    const { playerNameSelector } = config;
    const playerHeader = document.querySelector(playerNameSelector).textContent;

    return playerHeader;
  }

  _getPlayerHighSchool() {
    const { trimmedBioString: str } = this;
    const highSchoolRegExp = /(?=High School:)(.*)(?=Recruiting Rank)/;
    const altHighSchoolRegExp = /(?=High School:)(.*)(?=Draft:)/;
    const matchedString = str.match(highSchoolRegExp) || str.match(altHighSchoolRegExp);
    const hasMatch = matchedString !== null;

    if (!hasMatch) {
      return null;
    }

    const matches = matchedString[0];
    const highSchool = matches.split('High School: ')[1];

    return highSchool;
  }

  _getPlayerCollege() {
    const { trimmedBioString: str } = this;
    const collegeRegExp = /(?=College:)(.*)(?=High School:)/;
    const matchedString = str.match(collegeRegExp);
    const hasMatch = matchedString !== null;

    if (!hasMatch) {
      return null;
    }

    const matches = matchedString[0];
    const college = matches.split('College: ')[1];

    return college.trim();
  }

  _getPlayerBirthplace() {
    const { trimmedBioString: str } = this;
    const endAtRelativesExp = /(?=Born:)(.*)(?=Relatives:)/;
    const endAtCollegeExp = /(?=Born:)(.*)(?=College:)/;
    const endAtHSExp = /(?=Born:)(.*)(?=High School:)/;
    const endAtDraft = /(?=Born:)(.*)(?=College:)/;
    const potentialMatchA = str.match(endAtRelativesExp);
    const potentialMatchB = str.match(endAtCollegeExp);
    const potentialMatchC = str.match(endAtHSExp);
    const potentialMatchD = str.match(endAtDraft);
    const matchResults = potentialMatchA || potentialMatchB || potentialMatchC || potentialMatchD;
    const hasMatch = matchResults !== null;

    if (!hasMatch) {
      return '';
    }

    const birthLocation = matchResults[0].split('in')[1];
    const trimmedOutput = birthLocation.trim();

    return trimmedOutput;
  }

  _getPlayerDraft() {
    const { trimmedBioString: str } = this;
    const draftRegExp = /(?=Draft:)(.*)(?=NBA Debut:)/;
    const draftPosRegExp = /(?=\().*(?=pick)/;
    const draftStr = str.match(draftRegExp);
    const wasDrafted = draftStr !== null;

    if (!wasDrafted) {
      return null;
    }

    const splitStr = wasDrafted ? draftStr[0].split(',') : '';
    const draftClass = splitStr[3].trim();
    const draftYear = parseInt(draftClass, 0);
    const draftTeam = splitStr[0].split('Draft: ')[1].trim();
    const draftRound = parseInt(splitStr[1].trim(), 0);
    const draftPos = parseInt(
      splitStr[1].match(draftPosRegExp)[0][1].trim(),
      0
    );

    return {
      team: draftTeam,
      year: draftYear,
      position: { round: draftRound, position: draftPos }
    };
  }

  _getPlayerAttributes() {
    const { trimmedBioString: str } = this;
    const attrRegExp = /(?=Shoots).*(?=\) [BT])/;
    const heightRegExp = /\d*(?=cm)/;
    const weightRegExp = /\d*(?=kg)/;
    const handRegExp = /(?=Shoots: ).*(?=[0-9]-)/;
    const matchedStr = str.match(attrRegExp);
    const hasMatch = matchedStr !== null;

    if (!hasMatch) {
      return null;
    }

    const parsedAttributes = matchedStr[0];
    const weight = parsedAttributes.match(weightRegExp)[0];
    const height = parsedAttributes.match(heightRegExp)[0];
    const handStr = parsedAttributes.match(handRegExp)[0];
    const hand = handStr.split('Shoots: ')[1].trim();

    return { hand, height, weight };
  }

  _getPlayerPosition() {
    const { trimmedBioString: str } = this;
    const positionRegExp = /(?=Position:).*(?=▪)/;
    const matchedStr = str.match(positionRegExp);
    const hasMatch = matchedStr !== null;

    if (!hasMatch) {
      return null;
    }

    const parsedPositionA = matchedStr[0].split('Position: ')[1];
    const positions = parsedPositionA.split(' and ');
    const trimmedPositions = positions.map(position => position.trim());

    return trimmedPositions;
  }

  _getPlayerNicknames() {
    const { bioString: str } = this;
    const nicknameRegExp = /\(((?!born)(?!Age:)(?![0-9])(?!Full)[^)]+)\)/;
    const noParensRegExp = /([^(^)])/g;
    const nicknameStr = str.match(nicknameRegExp);
    const hasNickname = nicknameStr !== null;
    const parsedNickname = hasNickname
      ? nicknameStr[0].match(noParensRegExp).join('')
      : '';
    const nicknameArr = hasNickname ? parsedNickname.split(',') : [];

    return nicknameArr;
  }

  _getPlayerAge() {
    const { trimmedBioString: str } = this;
    const ageRegExp = /([0-9]+-[0-9]+d)/g;
    const age = str.match(ageRegExp)[0];

    return age;
  }

  _getPlayerBirthdate() {
    const { trimmedBioString: str } = this;
    const dateRegExp = /([A-Z][a-z]+ +[0-9]+, +[0-9]+)/;
    const dateOfBirth = str.match(dateRegExp)[0];

    return dateOfBirth;
  }

  async getPlayerObject() {
    const {
      tableIDs: statCategories, bio, contract, document, query
    } = this;
    const hasDocument = document !== undefined;
    if (!hasDocument) {
      await this._getPlayerPage(query);
    }
    const results = statCategories.reduce(
      (output, category) => {
        output[category] = this._getPlayerStats(category);

        return output;
      },
      {
        bio: bio ? this._getPlayerBio() : null,
        contract: contract ? this._getPlayerContract() : null
      }
    );

    return results;
  }

  /**
   *
   * @param {string} query
   * @param {*} options
   */
  static async get(
    query,
    options = { tableIDs: ['per_game'], bio: true, contract: false }
  ) {
    try {
      const player = new Player(query, options);
      const output = await player.getPlayerObject();
      return output;
    } catch (error) {
      return console.error(error);
    }
  }
}


module.exports = { get: Player.get, Player };
