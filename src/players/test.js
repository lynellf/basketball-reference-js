// const fs = require('fs');
const player = require('./index');

const getPlayer = async () => {
  try {
    const randomPlayer = await player.get('Antetokounmpo, Giannis', {
      tableIDs: [
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
      ],
      bio: true,
      contract: true
    });
    const output = JSON.stringify(randomPlayer);
    // console.log('done');
    // return fs.writeFileSync('player.json', output, 'utf8');
    return console.log({ output });
  } catch (error) {
    return console.log(error);
  }
};

getPlayer();
