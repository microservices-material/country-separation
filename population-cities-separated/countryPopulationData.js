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


/* country population - http services */

// price
app.get('/countries/:countryId/population',function(request,response) {
  const countryId = request.params.countryId
  const authToken = request.get("Authorization")

  auth.verifyToken(authToken)
    .then(function(plainToken) {
      try {
        var populationData = currentPopulationData(countryId)
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


  
console.log('country population service ready')
app.listen(3021)






