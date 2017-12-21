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
const countrySeparatedDataServiceHost = config.get("countrySeparatedDataService.host")
const countrySeparatedDataServicePort = config.get("countrySeparatedDataService.port")
const cityDataServiceHost = config.get("cityDataService.host")
const cityDataServicePort = config.get("cityDataService.port")


// functions to fetch city and population data through EntityServiceAccess
function fetchCityData(cityId, token) {
  return new service.EntityServiceAccess(
    cityDataServiceHost, cityDataServicePort, (cityId) => 'cities/' + cityId
  ).setToken(token).setEntityId(cityId).accessService()
}

function fetchCountryData(countryId, token, whichData) {
  return new service.EntityServiceAccess(
    countrySeparatedDataServiceHost, countrySeparatedDataServicePort, 
    (countryId) => 'countries/' + countryId + '/' + whichData
  ).setToken(token).setEntityId(countryId).accessService()
}



/* country consolidated data - http services */

app.get('/countries/:countryId/consolidatedData',function(request,response) {
  const countryId = request.params.countryId
  const authToken = request.get("Authorization")

  auth.verifyToken(authToken)
    .then(function(plainToken) {
      try {
        // get all country data
        Promise.all([
          fetchCountryData(countryId, authToken, 'mainData'), 
          fetchCountryData(countryId, authToken, 'mainCities'),
          fetchCountryData(countryId, authToken, 'population')
        ])
        .spread(function(countryData, mainCitiesIds, populationData) {
          countryData.population = populationData
          // get data about cities
          var mainCitiesFetchOps = Promise.all(mainCitiesIds.map(
            cityId => fetchCityData(cityId, authToken)
          ))
          return Promise.all([
            countryData,
            fetchCityData(countryData.capitalCityId, authToken), 
            mainCitiesFetchOps
          ])
        })
        .spread(function(countryData, capitalCityData, mainCitiesData) {
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
app.listen(8081, null, null, () => console.log('country consolidated information service ready'))




  






