const express = require("express");
const bodyParser = require("body-parser");
const request = require('request');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});


function sendMessage(recipientId, message) {  
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.EAAcGuXINiZA8BAE7nR6jGYv1ET9L5X6sPgeOUn4ri9vGLMb4cNZCFr7x49G8aljh1mUwezK2wnYdq8lW3dvOxjiB5bSvXIHG6f8Nb645LP9MLcxZAawjvXGWf0OxTD6X14kpZBGPmIixudr05xbsXouutiPPZAzihYAJwWdm11vsiu0i8PxTN},
      method: 'POST',
      json: {
          recipient: {id: recipientId},
          message: message,
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
  });
};

app.get('/', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'luan12211212') {
      res.status(200).send(req.query['hub.challenge']);
    } else {
      res.status(403).end();
    }
  });

app.post('/webhook', function (req, res) {  
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
    }
    res.sendStatus(200);
});

