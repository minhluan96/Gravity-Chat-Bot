const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const apiaiApp = require('apiai');
const appAI = apiaiApp("4d3a4b5d8a50469db227fd938cab7b71");

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
      res.status(200).send(req.query['hub.challenge']);
    } else {
      res.status(403).end();
    }
  });
  
  /* Handling all messenges */
  app.post('/webhook', (req, res) => {
    console.log(req.body);
    if (req.body.object === 'page') {
      req.body.entry.forEach((entry) => {
        entry.messaging.forEach((event) => {
          if (event.message && event.message.text) {
            sendMessage(event);
          }
        });
      });
      res.status(200).end();
    }
  });



  const request = require('request');

  function sendMessage(event) {
    let sender = event.sender.id;
    let text = event.message.text;

    let requestAI = appAI.textRequest(text, {
      sessionId: 'kitty_cat'
    });

    requestAI.on('response', (response) => {
      let aiText = response.result.fulfillment.speech;
      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: "EAACEYNGrkIgBAHZBu2kea8Azofmp2scwDb9etm03V9nZCVMo0Wa7hGbjEQQw3L19ZAg9TCmHYvE6ZAYjXid3Oztuuji82a46GZCYe8Nn6mmCwMTYQJyZC42swLndKpZB4HpaymXLdGVeno6PgyKfLlJtSBXjiJh9pb6rVRzsDDj8qDZBwgIYNLBy"},
        method: 'POST',
        json: {
          recipient: {id: sender},
          message: {text: aiText}
        }
      }, function (error, response) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
      });
    });

    requestAI.on('error', (error) => {
      console.log(error.message);
    });

    requestAI.end();
  }

  app.post('/ai', (req, res) => {
    if (req.body.result.action === 'weather') {
      let city = req.body.result.parameters['geo-city'];
      let restUrl = 'http://api.openweathermap.org/data/2.5/weather?APPID='+"4c506dd68b049133717f742ef5338187"+'&q='+city;
  
      request.get(restUrl, (err, response, body) => {
        if (!err && response.statusCode == 200) {
          let json = JSON.parse(body);
          let msg = json.weather[0].description + ' and the temperature is ' + json.main.temp + ' ℉';
          return res.json({
            speech: msg,
            displayText: msg,
            source: 'weather'});
        } else {
          return res.status(400).json({
            status: {
              code: 400,
              errorType: 'I failed to look up the city name.'}});
        }})
    }
  }); 