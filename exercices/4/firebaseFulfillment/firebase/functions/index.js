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
    agent.add('Comme je suis joueur, tu peux décider du nombre et je le trouverais !')
    agent.add('Chaque partie dure 5 tours. Si à la fin des 5 tours la réponse n\'a pas été trouvée, alors c\'est perdu !')
    agent.add('Si tu veux tenter ta chance en essayant de trouver un nombre dit "Jouer".')
    agent.add('Sinon dit "Deviner" et pour que ce soit moi qui devine.')
    agent.add('Tu as maintenant 3 niveau de difficulté !')
    agent.add('Facile : 10 tentatives')
    agent.add('Normal : 5 tentatives')
    agent.add('Difficile : 2 tentatives')
    agent.add('Que le meilleur gagne !')
    agent.add(new Suggestion("Jouer"))
    agent.add(new Suggestion("Deviner"))
  }
 
  function fallback(agent) {
    agent.add('Désolé, je ne peux satisfaire ta demande.')
    agent.add('Je n\'ai pas encore les compétences nécessaire...');
  }
  
  function jouer(agent) {
    let lifespan = 6
    
    if (agent.parameters.Difficulte === 'facile') {
        lifespan = 11
    } else if (agent.parameters.Difficulte == 'difficile') {
        lifespan = 3
    }
    
    agent.setContext({
      name: 'nombre_secret',
      lifespan,
      parameters: {
        valeur: randomInt(0, 100),
      },
    })
    agent.add('J\'ai choisi un nombre entre 0 et 100... C\'est à toi !')
  }
  
  function jouer_nombre(agent) {
    const { parameters, lifespan } = agent.getContext('nombre_secret')

    const nombre_secret = parameters.valeur
    const nombre_utilisateur = agent.parameters.number

    const derniere_tentative = lifespan === 1

    if (nombre_utilisateur === nombre_secret) {
      agent.clearContext('nombre_secret')
      agent.add('Tu as gagné !')
    }
    else if (derniere_tentative) {
      agent.add('Tu as perdu.')
    }
    else {
      agent.add(nombre_utilisateur < nombre_secret ? 'Plus grand...' : 'Plus petit...')
    }
  }
  
  function deviner(agent) {
    choisir_nombre(agent, 0, 100)
  }

  function choisir_nombre(agent, min, max) {
    const nombre = randomInt(min, max)
    agent.add(`Est-ce que c'est ${nombre} ?`)

    agent.setContext({
      name: 'nombre_choisi',
      lifespan: 5,
      parameters: {
        min,
        max,
        nombre,
      }
    })
  }

  function choisir_nombre_superieur(agent) {
    const { nombre, max } = agent.getContext('nombre_choisi').parameters
    choisir_nombre(agent, nombre + 1, max)
  }

  function choisir_nombre_inferieur(agent) {
    const { nombre, min } = agent.getContext('nombre_choisi').parameters
    choisir_nombre(agent, min, nombre - 1)
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Jouer', jouer);
  intentMap.set('Jouer nombre', jouer_nombre);
  intentMap.set('Deviner', deviner);
  intentMap.set('Nombre superieur', choisir_nombre_inferieur);
  intentMap.set('Nombre inferieur', choisir_nombre_superieur);
  agent.handleRequest(intentMap);
});
