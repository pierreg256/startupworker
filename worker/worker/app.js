﻿var http = require('http'),
  fs = require('fs')
  path = require('path')
  ;

global.appRoot = path.resolve(__dirname);

//Lets define a port we want to listen to
const PORT=8080;
const configFile=global.appRoot+'/iothub.json'

// Get IoTHub configuration
fs.readFile(configFile, function (err, data){
    if (err) {
        console.log('No config file ('+configFile+') found for the IoT Hub...')
    } else {
        
        var config;
        try {
            config = JSON.parse(data.toString('utf8'));
        } catch (e) {
            console.log('Unable to parse configuration file');
        }
        console.log(config)
    }
})

//We need a function which handles requests and send response
function handleRequest(request, response) {
    
    if (request.url.startsWith('/static/')) {
        if (fs.existsSync(global.appRoot + request.url)) {
            fs.readFile(global.appRoot + request.url, function (err, data){
                if (err) {
                    response.statusCode = 500;
                    response.end();
                    console.log("500:", request.method, request.url);
                } else {
                    var ext = request.url.split('.')[request.url.split('.').length - 1];
                    if (mimeTypes[ext]) {
                        response.setHeader("Content-Type", mimeTypes[ext])
                    }
                    response.end(data);
                    console.log("200:", request.method, request.url);
                }
            })
        } else {
            response.statusCode = 404;
            response.end();
            console.log("404:", request.method, request.url);
        }
    } else {
        if (request.url.startsWith('/devices/') && request.method == 'POST') {
            var fullBody = '';
            request.on('data', function (chunk) {
                fullBody += chunk;
            });
            request.on('end', function () {
                var msg;
                try {
                    msg = JSON.parse(fullBody);
                } catch (e) {
                    msg = undefined
                }
                if (msg && (request.url.split('/').length > 2) && request.url.split('/')[2].length>0) {
                    msg.deviceId = request.url.split('/')[2];
                    msg.timestamp = (new Date()).toISOString();
                    console.log(msg);
                    console.log("204:", request.method, request.url);
                    response.statusCode = 204;
                    response.end();
                } else {
                    response.statusCode = 400;
                    response.end();
                    console.log("400:", request.method, request.url);
                }
            });
        } else {
            //response.end('It Works!! Path Hit: ' + request.url);
            response.statusCode = 404;
            response.end();
            console.log("404:", request.method, request.url);
        }
    }
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

var mimeTypes = {
    "html": "text/html",
    "png": "image/png",
    "css": "text/css",
    "js": "application/javascript"
}