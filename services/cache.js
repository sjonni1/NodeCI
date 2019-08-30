const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

// const redisUrl = 'redis://127.0.0.1:6379'; this was refactored to use keys file
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this // by adding return this, then this function can be used as chainable later on
}

mongoose.Query.prototype.exec = async function() {
    if(!this.useCache) {
        return exec.apply(this, arguments);
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    // See if we have a value for 'key' in redis
    const cacheValue = await client.hget(this.hashKey, key);

    // If we do, return that
    if(cacheValue) {
        //console.log(cacheValue);
        //console.log(this) -> to find what is available in this instance like mongoose model
        //const doc = new this.model(JSON.parse(cacheValue)); -> this does not handle the case if it is an array or not
        const doc = JSON.parse(cacheValue);

        //Array.isArray(doc) ? its an array : its an object
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);


    }
    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments);

    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}