import getLogger from '../src/utils';

const moment = require('moment');
export const oldComputeBasal = ({ entries }) => {
  var json = JSON.stringify(entries);
  var notes = JSON.parse(json);
  //getLogger().debug(notes);

  let basal = notes
    .filter((e) => e.notes)
    .map((e) => ({
      time: e.created_at,
      notes: e.notes,
      empty_space: e.notes.indexOf(' '),
    }));
  getLogger().debug('this is the filtered treatments (basal):%o', basal);
  getLogger().debug('length%o', basal.length); // returns the number of boluses or lenghth of the array

  let basals = basal.map((entry) => ({
    ...entry,
    time: moment(entry.time).valueOf(),
  }));
  let timeSinceBasalMin = basals.map((entry) => ({
    ...entry,
    time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60 * 60),
    drug: entry.notes.slice(0, 3),
    dose: parseInt(entry.notes.slice(entry.empty_space), 10),
  }));
  getLogger().debug(
    'this is the trimmed down insulin and time since injection data:%o',
    timeSinceBasalMin,
  );

  let lastBasals = timeSinceBasalMin.filter(function (e) {
    return e.time <= 45; // keep only the basals from the last 45 hours
  });
  getLogger().debug('these are the last basals:%o ', lastBasals);

  let lastGLA = lastBasals.filter(function (e) {
    return (
      e.drug === 'gla' ||
      e.drug === 'Gla' ||
      e.drug === 'lan' ||
      e.drug === 'Lan'
    ); // keep only the glas from the last 45 hours
  });
  getLogger().debug('these are the last glargines: %o', lastGLA);

  let lastDET = lastBasals.filter(function (e) {
    return (
      e.drug === 'det' ||
      e.drug === 'Det' ||
      e.drug === 'lev' ||
      e.drug === 'Lev'
    ); // keep only the dets from the last 45 hours
  });
  getLogger().debug('these are the last detemirs: %o', lastDET);

  let lastTOU = lastBasals.filter(function (e) {
    return e.drug === 'tou' || e.drug === 'Tou'; // keep only the tous from the last 45 hours
  });
  getLogger().debug('these are the last toujeos: %o', lastTOU);

  let lastDEG = lastBasals.filter(function (e) {
    return (
      e.drug === 'deg' ||
      e.drug === 'Deg' ||
      e.drug === 'tre' ||
      e.drug === 'Tre'
    ); // keep only the degs from the last 45 hours
  });
  getLogger().debug('these are the last degludecs: %o', lastDEG);

  const datadet = JSON.stringify(lastDET, null, 4);
  const datagla = JSON.stringify(lastGLA, null, 4);
  const datatou = JSON.stringify(lastTOU, null, 4);
  const datadeg = JSON.stringify(lastDEG, null, 4);

  return {
    lastDET,
    lastGLA,
    lastTOU,
    lastDEG,
  };
};
