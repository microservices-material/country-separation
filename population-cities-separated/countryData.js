/* country consolidated data service - using a separated city data service */

// include libraries
const _ = require('lodash');                 // basic functions
const express = require('express')           // web server
const bodyParser = require("body-parser");   // addon to express, to make it able to parse post request bodies
const request = require('request')           // allows to perform HTTP requests
const Promise = require("bluebird")          // Promise implementation
var config = require('config');              // configuration (used for authentication key) in separated files

const auth = require('./authentication')       // our (tiny) authentication library
const service = require('./serviceAccess')     // our (tiny) library to access services


// library initialization
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// service constants
const countryPopulationServiceHost = config.get("countryPopulationService.host")
const countryPopulationServicePort = config.get("countryPopulationService.port")
const cityDataServiceHost = config.get("cityDataService.host")
const cityDataServicePort = config.get("cityDataService.port")


// functions to fetch city and population data through EntityServiceAccess
function fetchCityData(cityId, token) {
  return new service.EntityServiceAccess(
    cityDataServiceHost, cityDataServicePort, (cityId) => 'cities/' + cityId
  ).setToken(token).setEntityId(cityId).accessService()
}

function fetchPopulationData(countryId, token) {
  return new service.EntityServiceAccess(
    countryPopulationServiceHost, countryPopulationServicePort, 
    (countryId) => 'countries/' + countryId + '/population'
  ).setToken(token).setEntityId(countryId).accessService()
}



/* country consolidated data - http services */

app.get('/countries/:countryId/consolidatedData',function(request,response) {
  const countryId = request.params.countryId
  const authToken = request.get("Authorization")

  auth.verifyToken(authToken)
    .then(function(plainToken) {
      try {
        // get the info I handle
        var countryData = countryMainData(countryId)
        var mainCitiesIds = mainCities(countryId) 

        // access to separated services: country population and city data 
        // (the info I handle involves only city ids)

        /* data obtained through service access 
           - population data
           - name of the capital city
           - array of main city data
        */
        var mainCitiesFetchOps = Promise.all(mainCitiesIds.map(
          cityId => fetchCityData(cityId, authToken)
        ))
        Promise.all([
          fetchPopulationData(countryId, authToken), 
          fetchCityData(countryData.capitalCityId, authToken), 
          mainCitiesFetchOps
        ])
        .spread(function(populationData, capitalCityData, mainCitiesData) {
          countryData.population = populationData
          countryData.capitalCityName = capitalCityData.name
          countryData.mainCities = mainCitiesData
          response.status(200)
          response.json( countryData )
        })
        .catch(function(err) {
          response.status(400)    // bad request
          response.json( {"error": err} )
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


function latLng(lat,lng) { return { lat: lat, lng: lng} }

  






