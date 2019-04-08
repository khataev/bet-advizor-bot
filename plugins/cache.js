// const constants = require('./constants');
// const logger = require('./logger');

const Сache = function() {
  const cache = {}

  this.get = key => {
    return cache[key]
  }

  this.exists = key => {
    return cache[key] !== undefined
  }

  this.delete = key => {
    return delete cache[key]
  }

  this.add = (key, object) => {
    cache[key] = object
  }
}

module.exports = new Сache()
