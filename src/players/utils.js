/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/**
 * @param {{ [x: string]: number | string; }} [output]
 * @param {Element} cell
 */
const cellToKeyValPair = (output, cell) => {
  const statHeader = cell.getAttribute('data-stat');
  const hasStatHeader = statHeader !== null;

  if (!hasStatHeader) {
    throw new Error('The "data-stat" attribute does not exist in this table');
  }

  const statText = cell.textContent;
  const statValue = Number(statText);
  const statTextIsANumber = !isNaN(statValue);

  if (!statTextIsANumber) {
    output[statHeader] = statText;
  }

  if (statTextIsANumber) {
    output[statHeader] = statValue;
  }

  return output;
};

/**
 * @param {Element} row
 */
const rowsToArray = (row) => {
  const cells = [...row.children];
  const seasonStats = cells.reduce(cellToKeyValPair, {});

  return seasonStats;
};

/**
 * @param {string} str
 */
const trimWhitespace = (str) => {
  const wsRemovalRegExp = /\s{2,}/g;
  const trimmedStr = str.replace(wsRemovalRegExp, ' ');

  return trimmedStr;
};

/**
 * @param {string} normalizedQuery
 */
function nameCheck(normalizedQuery) {
  /**
   * @param {Element} playerItem
   */
  function callback(playerItem) {
    const playerName = playerItem.textContent;
    const normalizedPlayerName = playerName.toLowerCase();
    const isMatch = normalizedPlayerName.includes(normalizedQuery);

    if (!isMatch) {
      return false;
    }

    return true;
  }

  return callback;
}

/**
 * @param {boolean} isActive
 * @param {HTMLCollection} children
 */
const getPlayerPageURL = (isActive, children) => {
  if (!isActive) {
    return children[0].getAttribute('href');
  }

  return children[0].children[0].getAttribute('href');
};

module.exports = {
  cellToKeyValPair,
  getPlayerPageURL,
  nameCheck,
  rowsToArray,
  trimWhitespace,
};
