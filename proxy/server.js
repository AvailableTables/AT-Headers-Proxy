const express = require('express');
const morgan = require('morgan');
const path = require('path');
const axios = require('axios');
const app = express();
const parser = require('body-parser');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost', port : 6379});
const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(parser.json());
app.use(express.static(path.join(__dirname, 'public')));

redisClient.on('ready',function() {
  console.log("Redis is ready");
 });
 
 redisClient.on('error',function() {
  console.log("Error in Redis");
 });

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/favicon.ico', (req, res) => {
  res.send();
});

const components = require('./service-config.js');
app.get('/restaurants/:id', async (req, res) => {
  let id = req.params.id;
  redisClient.get(id, async ( err, reply) => {
    if (reply) {
      console.log('key found, sending reply');
      res.send(reply);
    }
    else {
      console.log('key not found, adding key')
      let results = await Promise.all([
        axios.get(`${components.headers.url}?id=${id}`)
      ])
    
      let headersData = {html: results[0].data.html, images: results[0].data.images}
      let response = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <!-- <link rel="stylesheet" href="http://3.16.45.212/styles.css"> -->
          <link rel="stylesheet" href="/style.css">
          <title>FEC - TableOpen</title>
        </head>
        <body>
          <div class="body">
            <div id="Headers">${headersData.html}</div>
            <div class="mainbody">
              <div id="Reservations"></div>
              <div class="data">
                <div id="Overview"></div>
                <div id="Reviews"></div>
              </div>
            </div>
          </div>
          <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
          <script type="text/javascript" src="${components.headers.bundle}"></script>
          <script>
            ReactDOM.hydrate(
              React.createElement(Headers, ${JSON.stringify(headersData)}),
              document.getElementById('Headers')
            );
          </script>
        </body>
      </html>
      ` 
      redisClient.set(id, response, 'EX', 900, () => {
        console.log('OK');
      })

      res.send(response)
    }
  })
})

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});



