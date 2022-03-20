const moment = require('moment');
module.exports = function(treatments = []) {
  const now = moment();
  const meals = treatments
    .filter(e => e.carbs && moment(e.mills).diff(now, 'minutes') > -360)
    .map(e => ({
      ...e,
      time:  (Date.now() - moment(e.mills).valueOf()) / (1000 * 60)
    }));

  console.log('Last 6 hours meal:', meals);
  return meals;
};
