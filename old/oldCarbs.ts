import moment = require('moment');
import logger from '../src/utils';

export const oldCarbs = (meal, carbAbsTime) => {
  const meals = meal.map((entry) => ({
    ...entry,
    time: moment(entry.time).valueOf(),
  }));
  const timeSinceMealMin = meals.map((entry) => ({
    ...entry,
    mills: entry.time,
    time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60),
  }));
  logger.debug(
    'this is the trimmed down meals and time since last meal:%o',
    timeSinceMealMin
  );

  // this is for the calculations of carbs ingestion
  let lastMeals = timeSinceMealMin.filter(function (e) {
    return e.time <= 360; // keep only the meals from the last 6 hours or 360 min
  });

  var karbs = lastMeals;

  const fast_carbAbsTime = carbAbsTime / 6; // = 1 h or 60 min
  const slow_carbAbsTime = carbAbsTime / 1.5; // = 4 h or 240 min

  let timeSinceMealAct = karbs.map((entry) => {
    var t = entry.time;
    var carbs_g = entry.carbs;

    // the first 40g of every meal are always considered fast carbs
    var fast = Math.min(entry.carbs, 40);

    // the amount exceeding 40 grams will be randomly split into fast and slow carbs
    var rest = entry.carbs - fast;
    var FSR = Math.random() * (0.4 - 0.1) + 0.1; // FSR = FAST RANDOM RATIO

    // all fast carbs counted together
    var fast_carbs = fast + FSR * rest;

    // the remainder is slow carbs
    var slow_carbs = (1 - FSR) * rest;

    //console.log(fast_random_ratio);
    //console.log(fast_carbs);
    //console.log(slow_carbs);
    logger.debug(
      'carbs_g:%o',
      carbs_g,
      'fast:%o',
      fast,
      'rest:%o',
      rest,
      'fast_carbs:%o',
      fast_carbs,
      'slow_carbs:%o',
      slow_carbs
    );

    if (t < fast_carbAbsTime / 2) {
      var AT2 = Math.pow(fast_carbAbsTime, 2);
      var fast_carbrate = (fast_carbs * 4 * t) / AT2;
      //	var COB = (fast_carbs * 2 * Math.pow(t, 2)) / AT2;
    } else if (t < fast_carbAbsTime) {
      var fast_carbrate =
        ((fast_carbs * 4) / fast_carbAbsTime) * (1 - t / fast_carbAbsTime);
      // var AAA = (4 * fast_carbs / fast_carbAbsTime);
      // var BBB = Math.pow(t, 2) / (2 * fast_carbAbsTime);
      //	var COB = (AAA * (t - BBB)) - fast_carbs;
    } else {
      var fast_carbrate = 0;
      //var COB = 0;
      logger.debug('fast carb absorption rate:%o', fast_carbrate);
    }

    if (t < slow_carbAbsTime / 2) {
      var AT2 = Math.pow(slow_carbAbsTime, 2);
      var slow_carbrate = (slow_carbs * 4 * t) / AT2;
      // var COB = (slow_carbs * 2 * Math.pow(t, 2)) / AT2;
    } else if (t < slow_carbAbsTime) {
      var slow_carbrate =
        ((slow_carbs * 4) / slow_carbAbsTime) * (1 - t / slow_carbAbsTime);
      // var AAA = (4 * slow_carbs / slow_carbAbsTime);
      // var BBB = Math.pow(t, 2) / (2 * slow_carbAbsTime);
      // var COB = (AAA * (t - BBB)) - slow_carbs;
    } else {
      var slow_carbrate = 0;
      // var COB = 0;
      logger.debug('slow carb absorption rate:%o', slow_carbrate);
    }

    return {
      ...entry,
      time: t,
      fast_carbrate: fast_carbrate,
      slow_carbrate: slow_carbrate,
      all_carbrate: fast_carbrate + slow_carbrate,
    };
  });
  logger.debug(timeSinceMealAct);

  var totalCarbRate = timeSinceMealAct.reduce(function (tot, arr) {
    return tot + arr.all_carbrate;
  }, 0);

  logger.debug(totalCarbRate);
  return totalCarbRate;

  // let carbrateString = JSON.stringify(totalCarbRate);
  // const fs = require('fs');
  // fs.writeFile("./files/latest_carbs.json", carbrateString, function (err, result) {
  // 	if (err) console.log('error', err);
  // });
};
