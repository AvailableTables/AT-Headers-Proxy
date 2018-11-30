const fs = require('fs');
const fetch = require('node-fetch');
const Promise = require('bluebird');
const exists = Promise.promisify(fs.stat);

const loadBundle = function(cache, item, fileName) {
  // add a small delay to ensure pipe has closed
  setTimeout(() => {
    console.log('loading:', fileName);
    cache[item] = require(fileName).default;    
  }, 0);
};

const fetchBundles = (path, services, suffix = '', required = false) => {
  Object.keys(services).forEach(service => {
    const fileName = `${path}/${service}${suffix}.js`;
    exists(fileName)
      .then( () => {
        required ? loadBundle(services, service, fileName) : null
      })
      .catch(err => {
        if (err.code === 'ENOENT') {
          const url = `${services[service]}${suffix}.js`;
          console.log(`Fetching: ${url}`);
          fetch(url)
          .then(results => {
            const file = fs.createWriteStream(fileName)
            results.body.pipe(file);
            results.body.on('end', () => {console.log('bundle created')});
          })
        }
        else console.log('unknown fs error: ', err);
      })
  })
}

module.exports = (clientPath, serverPath, services) => {
  fetchBundles(clientPath, services);
  fetchBundles(serverPath, services, '-server', true);

  console.log('returning services: ', services.Headers)
  return services;
}