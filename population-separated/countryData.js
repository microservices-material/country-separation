/* country consolidated data service -- accessing population as a separate service */

// include libraries
const _ = require('lodash');                 // basic functions
const express = require('express')           // web server
const bodyParser = require("body-parser");   // addon to express, to make it able to parse post request bodies
const request = require('request')           // allows to perform HTTP requests
const Promise = require("bluebird")          // Promise implementation
var config = require('config');              // configuration (used for authentication key) in separated files

const auth = require('./authentication')       // our (tiny) authentication library
const service = require("./serviceAccess")   // our library to service access

// library initialization
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// service constants
const countryPopulationServiceHost = config.get("countryPopulationService.host")
const countryPopulationServicePort = config.get("countryPopulationService.port")

var populationDataFetcher = new service.EntityServiceAccess(
  countryPopulationServiceHost, 
  countryPopulationServicePort, 
  (countryId) => 'countries/' + countryId + '/population' // endpointBuilder
)


/* country consolidated data - http services */

app.get('/countries/:countryId/consolidatedData',function(request,response) {
  const countryId = request.params.countryId
  const authToken = request.get("Authorization")

  auth.verifyToken(authToken)
    .then(function(plainToken) {
      try {
        var countryData = countryMainData(countryId)
        var mainCitiesData = mainCities(countryId) 
        populationDataFetcher.setToken(authToken).setEntityId(countryId)
        .accessService()
        .then(function(populationData) {
          countryData.population = populationData
          countryData.mainCities = mainCitiesData
          response.status(200)
          response.json( countryData )
        })
        .catch(function(theError) {
          response.status(theError.statusCode)    
          response.json( {"error": theError.errorDescription} )
        })
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

// token generation
app.post('/token',function(request,response) {
  const theUserName = request.body.userName
  auth.generateToken(theUserName)
    .then(function(theToken) {
      response.status(200)
      response.json( { token: theToken } )
    })
    .catch(function(err) {
      response.status(500)    // internal server error
      response.json( { error: err} )
    })
})


/* make app ready to accept requests */
app.listen(8081, null, null, () => console.log('country information service ready'))


/*
 business functions
*/

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
  var capitalData = cityData(theData.capitalCityId)
  theData.capitalCityName = capitalData.name
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
  return theCities.map((cityId) => cityData(cityId))
}

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
    throw new Error("There is no city having id " + countryId)
  }
  theData.cityId = cityId
  return theData
}


function latLng(lat,lng) { return { lat: lat, lng: lng} }

  






