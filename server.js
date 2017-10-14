const express = require('express');
const bodyParser = require('body-parser');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Load the AWS SDK
const AWS = require('aws-sdk');

// Use our env vars for setting credentials
AWS.config.update({
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY
});

// Create an S3 client setting the Endpoint to DigitalOcean Spaces
var spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
var s3 = new AWS.S3({endpoint: spacesEndpoint});

app.get("/", function (request, response) {  
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/success", function (request, response) {  
  response.sendFile(__dirname + '/views/success.html');
});

app.get("/error", function (request, response) {  
  response.sendFile(__dirname + '/views/error.html');
});

app.post('/bucketName', function (request, response) {
  var bucketName = request.body.name;
  var keyName = 'hello_spaces.txt';

  console.log("Creating bucket: " + bucketName);
  s3.createBucket({Bucket: bucketName}, function(err, data) {
    if (err) {
      console.log(err);
      response.redirect("/error");
    } else {
      console.log("Bucket created");
      var params = {Bucket: bucketName, Key: keyName, Body: 'Hello World!'};
      s3.putObject(params, function(err, data) {
        if (err) {
          console.log(err);
          response.redirect("/error");
        } else {
          console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
          response.redirect("/success");
        }
      });
    }
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
