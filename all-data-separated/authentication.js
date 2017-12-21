/* authentication library */

// include libraries
const _ = require('lodash');                 // basic functions
const jwt = require('jsonwebtoken')          // handles authentication tokens
const Promise = require("bluebird")          // Promise implementation
var config = require('config');              // configuration (used for authentication key) in separated files



/*
 authentication functions 
*/
const ultraSecretKey = config.get("ultraSecretKey")
// nunca jamas poner una clave plana en un repo de codigo

function verifyToken(token) {
 return Promise.promisify(jwt.verify)(token, ultraSecretKey, {}) 
}

function generateToken(userName) {
  const payload = {userName: userName}
  return new Promise(function(fulfill,reject) {
    jwt.sign(payload, ultraSecretKey, {}, function(err, token) {
      if (err) { 
        reject(err) 
      } else {
        fulfill(token)
      }
    })
  })
}

// function generateToken(userName) {
//   const payload = {userName: userName}
//   return Promise.promisify(jwt.sign)(payload, ultraSecretKey, {})
// }


module.exports.verifyToken = verifyToken
module.exports.generateToken = generateToken






