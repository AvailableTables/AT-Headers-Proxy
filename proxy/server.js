const express = require('express');
const morgan = require('morgan');
const path = require('path');
const axios = require('axios');
const app = express();
const parser = require('body-parser');
const fetch = require('node-fetch');
// const services = require('./public/services.js');
const fs = require('fs');
const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(parser.json());
app.use(express.static(path.join(__dirname, 'public')));

const clientBundles = './public/services';
const serverBundles = './templates/services';
const serviceConfig = require('./service-config.js');
const services = require('./loader.js')(clientBundles, serverBundles, serviceConfig);
const application = require('./templates/services/Headers-server.js');
console.log('services in server is: ', services)
// console.log('application is: ', application)

const React = require('react');
const ReactDOM = require('react-dom/server');
const Layout = require('./templates/layout.js');
const App = require('./templates/app.js');
const Scripts = require('./templates/scripts.js');

const renderComponents = (components, props = {}) => {
  return Object.keys(components).map(component => {
    console.log('components are: ', components)
    console.log('component is: ', components[component]);
    let temp = React.createElement("http://localhost:3040/headers", props);
    console.log('temp is: ', temp)
    return ReactDOM.renderToString(temp);
  })
  // let temp = React.createElement(components, props)
  // return ReactDOM.renderToString(temp);
}

app.get('/headers/:id', (req, res) => {
  console.log('app.get application is: ', services);
  let components = renderComponents(services, {id: req.params.id});
  res.end(Layout(
    'SDC Proxy',
    App(...components),
    Scripts(Object.keys(services))
  ))
})

//////////////////
app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/favicon.ico', (req, res) => {
  res.send();
});

app.get('/restaurants/*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// Reviews Service
// app.get('/API/Reviews/*', (req, res) => {
//   axios.get(`http://34.207.247.29${req.url}`)
//     .then((results) => {
//       res.send(results.data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send();
//     });
// });

// Overview Service
// app.get('/api/*', (req, res) => {
//   axios.get(`http://3.16.45.212${req.url}`)
//     .then((results) => {
//       res.send(results.data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send();
//     });
// });

// Reservations Service
// app.get('/reservations/*', (req, res) => {
//   axios.get(`http://18.217.247.139${req.url}`)
//     .then((results) => {
//       res.send(results.data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send();
//     });
// });

// Header

app.get('/api/header/:id', (req, res) => {
  const url = `http://localhost:3040${req.url}`
  axios.get(url)
  .then( ({data}) => {
    res.send(data)
  })
  .catch( (err) => {console.log('error on get to api/header')})
})

// app.get('/header', (req, res) => {
//   axios.get(`http://34.207.247.29:8888${req.url}`)
//     .then((results) => {
//       res.send(results.data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send();
//     });
// });

// Header
// app.post('/header', (req, res) => {
//   console.log(req.body);
//   axios.post(`http://34.207.247.29:8888${req.url}`, {id: req.body.id})
//     .then((results) => {
//       res.send(results.data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send();
//     });
// });

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});



