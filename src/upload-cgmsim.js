 const fetch = require('node-fetch');

 //let's build the API_secret for the headers and the API_url for the fetch() function
 //===================================================================================
 // var fs = require('fs');

 module.exports = function(cgmsim, env) {
     const { postParams } = require('./setupParams')(env);

     const api_url = env.NIGHTSCOUT_URL + '/api/v1/entries/';
     const body_json = JSON.stringify(cgmsim);

     return fetch(api_url, {
             ...postParams,
             body: body_json,
         })
         .then(() => {
             console.log('NIGTHSCOUT Updated');
         })
         .catch(err => {
             console.log(err);
         });
 };