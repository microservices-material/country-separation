/* city data service */

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


/* city data - http services */

app.get('/cities/:cityId',function(request,response) {
  const cityId = request.params.cityId
  const authToken = request.get("Authorization")

  auth.verifyToken(authToken)
    .then(function(plainToken) {
      try {
        var theData = cityData(cityId)
        response.status(200)
        response.json( theData )
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
app.listen(8083, null, null, () => console.log('city data service ready'))

/*
 business functions
*/

function cityData(cityId) {
  var theData = null
  if (cityId == 1001) {
    theData = { name: 'Buenos Aires', latLng: latLng(-34.6,-58.38), population: 13588171 }
  } else if (cityId == 1002) {
    theData = { name: 'Cordoba', latLng: latLng(-31.42,-64.18), population:  1535868 }
  } else if (cityId == 1003) {
    theData = { name: 'Rosario', latLng: latLng(-32.95,-60.65), population:  1690816 }
  } else if (cityId == 2001) {
    theData = { name: 'Brasilia', latLng: latLng(-15.79,-47.88), population:  2977216 }
  } else if (cityId == 2002) {
    theData = { name: 'Rio de Janeiro', latLng: latLng(-22.91,-43.2), population: 12090607 }
  } else if (cityId == 2003) {
    theData = { name: 'Sao Paulo', latLng: latLng(-23.5, -46.62), population: 21091791 }
  } else if (cityId == 3001) {
    theData = { name: 'Bangkok', latLng: latLng(13.75, 100.52), population: 11971000 }
  } else if (cityId == 3002) {
    theData = { name: 'Chiang Mai', latLng: latLng(18.79, 98.98), population: 700000 }
  } else {
    throw new Error("There is no city having id " + cityId)
  }
  theData.cityId = cityId
  return theData
}


function latLng(lat,lng) { return { lat: lat, lng: lng} }

  






