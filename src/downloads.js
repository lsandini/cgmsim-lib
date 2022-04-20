const logger = require('pino')();
const fetch = require('node-fetch');
const downloads = async (env) => {
    const { getParams } = require('./setupParams')(env);

    const api_url = env.NIGHTSCOUT_URL + '/api/v1/treatments';
    const api_profile = env.NIGHTSCOUT_URL + '/api/v1/profile.json';
    const api_sgv = env.NIGHTSCOUT_URL + '/api/v1/entries/sgv.json';

    const treatments = await fetch(api_url, getParams)
        .then(resTreatments => resTreatments.json())
        .catch(err => logger.error(err));

    const profiles = await fetch(api_profile, getParams)
        .then(resProfile => resProfile.json());

    const entries = await fetch(api_sgv, getParams)
        .then(resSGV => resSGV.json());

    return {
        treatments,
        profiles,
        entries,
    };
};
module.exports = downloads;