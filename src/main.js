const perlinRun = require('./perlin');
const computeBolusIRun = require('./computeBolusIOB.js');
const computeBasalIOBRun = require('./computeBasalIOB.js');
const detemirRun = require('./detemir.js');
const glargineRun = require('./glargine.js');
const degludecRun = require('./degludec.js');
const toujeoRun = require('./toujeo.js');
const allMealsRun = require('./all_meals.js');
const carbsRun = require('./carbs.js');
const arrowsRun = require('./arrows.js');
const liverRun = require('./liver.js');
const sgvStartRun = require('./sgv_start.js');

console.log('Run Init');
let perls = perlinRun();

const main = ({
    env,
    entries,
    treatments,
    profiles,
    pumpBasals
}) => {
    const weight = parseInt(env.WEIGHT);
    if (!perls || perls.length === 0) {
        perls = perlinRun();
    }
    
	const { resultAct } = computeBolusIRun({ treatments }, env);
    const { lastDET, lastGLA, lastTOU, lastDEG } = computeBasalIOBRun(treatments);
    const lastMeals = allMealsRun(treatments);
    
	const det = detemirRun(weight, lastDET);
    const gla = glargineRun(weight, lastGLA);
    const degludec = degludecRun(weight, lastDEG);
    const tou = toujeoRun(weight, lastTOU);
    
	const carbs = carbsRun(env, lastMeals);
    const liver = liverRun(env);

    const cgmsim = sgvStartRun({ entries, det, gla, degludec, tou, liver, carbs, resultAct, perls, profiles, pumpBasals, treatments, }, env);
    
	console.log('this is the new sgv:', cgmsim);
    const arrows = arrowsRun([cgmsim, ...entries]);
    cgmsim.direction = arrows[0].direction;
    return cgmsim;
};

module.exports = main;