'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const randomInt = require('random-int')
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
 
  function welcome(agent) {
    agent.add('Salutations ! Je suis un robot qui décide d\'un nombre entre 0 et 100.')
    agent.add('Chaque partie dure 5 tours.')
    agent.add('Si à la fin des 5 tours la réponse n\'a pas été trouvée, alors c\'est perdu !')
    agent.add('Dit "Jouer" pour commencer une partie !')
  }
 
  function fallback(agent) {
    agent.add('Désolé, je ne peux satisfaire ta demande.')
    agent.add('Je n\'ai pas encore les compétences nécessaire...');
  }
  
  function jouer(agent) {
    agent.context.set({
      name: 'nombre_secret',
      lifespan: 6,
      parameters: {
        valeur: randomInt(0, 10),
      },
    })
    agent.add('J\'ai choisi un nombre entre 0 et 10... C\'est à toi !')
  }
  
  function jouer_nombre(agent) {
    const { parameters, lifespan } = agent.context.get('nombre_secret')

    const nombre_secret = parameters.valeur
    const nombre_utilisateur = agent.parameters.number

    const derniere_tentative = lifespan === 1

    if (nombre_utilisateur === nombre_secret) {
      agent.context.delete('nombre_secret')
      agent.add('Tu as gagné !')
    }
    else if (derniere_tentative) {
      agent.add('Tu as perdu.')
    }
    else {
      agent.add(nombre_utilisateur < nombre_secret ? 'Plus grand...' : 'Plus petit...')
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Jouer', jouer);
  intentMap.set('Jouer nombre', jouer_nombre);
  agent.handleRequest(intentMap);
});
