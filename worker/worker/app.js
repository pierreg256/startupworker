var http = require('http'),
  fs = require('fs')
  ;

//Lets define a port we want to listen to
const PORT=8080;
const configFile='iothub.json'

// Get IoTHub configuration
fs.readFile(configFile, function (err, data){
    if (err) {
        console.log('No config file found for the IoT Hub...')
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
        if (fs.existsSync('.' + request.url)) {
            fs.readFile('.' + request.url, function (err, data){
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
        //response.end('It Works!! Path Hit: ' + request.url);
        response.statusCode = 404;
        response.end();
        console.log("404:", request.method, request.url);
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