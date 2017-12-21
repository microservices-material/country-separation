/* country population data service */

// include libraries
const _ = require('lodash');                 // basic functions
const express = require('express')           // web server
const bodyParser = require("body-parser");   // addon to express, to make it able to parse post request bodies
const request = require('request')           // allows to perform HTTP requests
const jwt = require('jsonwebtoken')          // handles authentication tokens
const Promise = require("bluebird")          // Promise implementation

const auth = require('./authentication')       // our (tiny) authentication library

// library initialization
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// utility function to create simple services
function giveService(request, response, dataFunction) {
  const countryId = request.params.countryId
  const authToken = request.get("Authorization")

  auth.verifyToken(authToken)
  .then(function(plainToken) {
    try {
      let populationData = dataFunction(countryId)
      response.status(200)
      response.json( populationData )
    } catch (e) {
      response.status(400)    // bad request
      response.json( {"error": e.message} )
    }
  })
  .catch(function(err) {
    response.status(401)    // unauthorized
    response.json( { error: 'Invalid token'} )
  })
}


/* country separated data - http services */

// population
app.get('/countries/:countryId/population',function(request,response) {
  giveService(request, response, currentPopulationData)
})

// mainData
app.get('/countries/:countryId/mainData',function(request,response) {
  giveService(request, response, countryMainData)
})

// mainData
app.get('/countries/:countryId/mainCities',function(request,response) {
  giveService(request, response, mainCities)
})


/* make app ready to accept requests */
app.listen(8082, null, null, () => console.log('country population service ready'))




/*
 business functions
*/

function currentPopulationData(countryId) {
  var theData = null
  if (countryId == 1) {
    theData = { total: 44272125, males: 21668578, females: 22603547 }
  } else if (countryId == 2) {
    theData = { total: 211243220, males: 103802340, females: 107440880 }
  } else if (countryId == 3) {
     theData = { total: 68292388, males: 33628208, females: 34664180 }
  } else {
    throw new Error("There is no country having id " + countryId)
  }
  theData.countryId = countryId
  return theData
}

function countryMainData(countryId) {
  var theData = null
  if (countryId == 1) {
    theData = { name: 'Argentina', continent: 'America', capitalCityId: 1001 }
  } else if (countryId == 2) {
    theData = { name: 'Brazil', continent: 'America', capitalCityId: 2001 }
  } else if (countryId == 3) {
    theData = { name: 'Thailand', continent: 'Asia', capitalCityId: 3001 }
  } else {
    throw new Error("There is no country having id " + countryId)
  }
  theData.countryId = countryId
  return theData
}

function mainCities(countryId) {
  var theCities = null
  if (countryId == 1) {
    theCities = [1001, 1002, 1003]
  } else if (countryId == 2) {
    theCities = [2001, 2002, 2003]
  } else if (countryId == 3) {
    theCities = [3001, 3002]
  } else {
    throw new Error("There is no country having id " + countryId)
  }
  return theCities
}



  
console.log('country separated data service ready')
app.listen(3021)






