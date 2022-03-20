const moment = require('moment');

module.exports = function({ treatments }) {

  // let's read all the meals gathered by get-all.sh, and compute the total amount of carbs
  // in the 1410 last minutes (23:30 min)
  if (moment().hours() === 23) {

    const totalMeals = treatments.filter(entry =>
      moment(entry.mills).format('YYYYMMDD') === moment().format('YYYYMMDD'));

    console.log('totalMeals ', totalMeals);

    const totalCarbs = totalMeals.reduce(function(tot, arr) {
      return tot + arr.carbs;
    }, 0);

    console.log(totalCarbs);
    if (totalCarbs < 200) {
      return {
        time: Date.now()
        , carbs: (200 - totalCarbs).toString()
        , enteredBy: 'surprise_Meal_Generator'
      , };
    }
    return null;
  } else {
    return null;
  }
};
