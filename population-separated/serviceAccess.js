const request = require('request')           // allows to perform HTTP requests
const Promise = require("bluebird")          // Promise implementation

/*
 generic service access object definition
*/
class ServiceAccess {
  constructor(host, port) {
    this._host = host
    this._port = port
  }
  
  host() { return this._host }
  port() { return this._port }
  token() { return this._token }
  setToken(theToken) { this._token = theToken ; return this }

  statusCodeBadResponse() { return null }
  statusCodeNoResponse() { return null }

  endpoint() { return this.host() + ':' + this.port() + '/' + this.specificEndpoint() }

  invokeService() { 
    console.log('querying URL: ' + this.endpoint())
    return Promise.promisify(request, {multiArgs:true})
      ({ url: this.endpoint() , method: 'GET', json: true,
         headers: {Authorization: this.token() }
      })
  }

  accessService() {
    const self = this
    return new Promise(function(fulfill, reject) {
      self.invokeService().spread(function(response, body) {
          if (response.statusCode == 200) {
            fulfill(body)
          } else {
            reject({statusCode: self.statusCodeBadResponse() || response.statusCode, errorDescription: body.error})
          }      
        }) 
        .catch( function(error) {
          reject({statusCode: self.statusCodeNoResponse() || 500, errorDescription:'communication error: ' + error})
        })
    }) 
  }
}

class EntityServiceAccess extends ServiceAccess {
  constructor(host, port, endpointBuilder) {
    super(host, port)
    this._endpointBuilder = endpointBuilder
  }

  entityId() { return this._entityId }
  setEntityId(theId) { this._entityId = theId ; return this }

  endpointBuilder() { return this._endpointBuilder }

  specificEndpoint() { return this.endpointBuilder()(this.entityId()) }
}



module.exports.EntityServiceAccess = EntityServiceAccess
