'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
 
  function welcome(agent) {
    agent.add('Salutations ! Je suis un robot qui décide d\'un nombre entre 0 et 100.')
    agent.add('Chaque partie dure 5 tours.')
    agent.add('Si à la fin des 5 tours la réponse n\'a pas été trouvée, alors c\'est perdu !')
  }
 
  function fallback(agent) {
    agent.add('Désolé, je ne peux satisfaire ta demande.')
    agent.add('Je n\'ai pas encore les compétences nécessaire...');
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});
