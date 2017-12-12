/* country consolidated data service - using a separated city data service */

// include libraries
const _ = require('lodash');                 // basic functions
const express = require('express')           // web server
const bodyParser = require("body-parser");   // addon to express, to make it able to parse post request bodies
const request = require('request')           // allows to perform HTTP requests
const Promise = require("bluebird")          // Promise implementation

const auth = require('./authentication')       // our (tiny) authentication library
const service = require('./serviceAccess')     // our (tiny) library to access services


// library initialization
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// functions to fetch city and population data through EntityServiceAccess
function fetchCityData(cityId, token) {
  return new service.EntityServiceAccess(3011, (cityId) => 'cities/' + cityId)
    .setToken(token).setEntityId(cityId).accessService()
}

function fetchPopulationData(countryId, token) {
  return new service.EntityServiceAccess(3021, (countryId) => 'countries/' + countryId + '/population')
    .setToken(token).setEntityId(countryId).accessService()
}



/* country consolidated data - http services */
app.get('/countries/:countryId/consolidatedInfo',function(request,response) {
  const countryId = request.params.countryId
  const authToken = request.get("Authorization")

  auth.verifyToken(authToken)
    .then(function(plainToken) {
      try {
        let countryData = countryMainData(countryId)
        let mainCitiesIds = mainCities(countryId) 

        // we need to query city data, at this point we have only the ids
        // and also population data
        let capitalCityQuery = fetchCityData(countryData.capitalCityId, authToken)
        let mainCitiesQuery = Promise.all(mainCitiesIds.map(
          cityId => fetchCityData(cityId, authToken)
        ))
        Promise.all([
          fetchPopulationData(countryId, authToken), 
          capitalCityQuery, 
          mainCitiesQuery
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



/*
 business functions
*/
function countryMainData(countryId) {
  let theData = null
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
  let theCities = null
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

  
console.log('country information service ready')
app.listen(3001)






