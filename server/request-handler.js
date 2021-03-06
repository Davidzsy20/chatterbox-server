/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var urlParser = require('url');
var fs = require('fs');
var _mysql = require('mysql');
// var Sequelize = require('sequelize');
// var sequelize = new Sequelize("chatterboxserver", "root", null, {
//   host: '127.0.0.1',
//   dialect: "mysql",

// });

// var User = sequelize.define("user", {username: {
//     type: Sequelize.STRING,
//   }
// });

// User.sync({force: true}).then(function(){
//   return User.create({username:"COOPER"});
// });

var mysql = _mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "chatterboxserver",
});

mysql.connect(function(err){
  if(err){
    console.log("error connecting mysql ", err.stack);
  }else{
    console.log("connected as ID ", mysql.threadId);
  }
});

var queryMessages = function(statusCode, headers, response){
  mysql.query("select * from messages;", function(err, result){
  if(err){
    console.log("error ", err);
  }else{
    //console.log("RESULT ",result);
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({results:result}));
  }
});
}


var queryInsertMessage = function(message, statusCode, headers, response){
var params = [message.username, message.text, message.roomname];

  mysql.query("insert into messages(username, text, roomname) values(?,?,?);", params, function(err, result){
    if(err){
      console.log("error ", err);

    }else{
      console.log("it inserted " + JSON.stringify(result));

        response.writeHead(statusCode, headers);
        response.end(JSON.stringify({results:result}));
    }
  });
 }

var messages = [{username: "SYSTEM", text: "WELCOME TO CHAT", roomname: "LOBBY"}];
var rooms = [{roomname: "LOBBY"}];
// var firstMessage = JSON.stringify({username: "cooper", text: "hello", roomname: "room1"});
// fs.appendFile('server/messages.txt', firstMessage + "\n", function(err){
//   if(err){
//     console.log(err);
//   }
// });
var getMessagesArray = function(statusCode, headers, response){
  fs.readFile('server/messages.txt', function(err, data){
    if(err){

    }
   response.writeHead(statusCode, headers);
   response.end(JSON.stringify({results:data.toString().split("\n")}));

  });
};

var writeMessage = function(message){
  fs.appendFile('server/messages.txt', message + "\n", function(err){
    if(err){
      console.log(err);
    }
  });
}


var endMessage = function(response, statusCode, data) {
  // See the note below about CORS headers.
  //console.log(statusCode);
  console.log("INSIDE OF END MESSAGE",data);
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify({results:messages}));
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);

  var requestMethod = request.method;
  // The outgoing status.
  var statusCode;

  var urlParts = urlParser.parse(request.url);
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  console.log(request.url);
  console.log(urlParts.pathname.slice(8));


  if (urlParts.pathname === '/classes/messages') {
    if(requestMethod === 'GET') {
      statusCode = 200;
      queryMessages(statusCode, headers, response);
      //getMessagesArray(statusCode, headers, response);
      // console.log("MESSAGES RIGHT HERE ", messages);
      // response.writeHead(statusCode, headers);
      // response.end(JSON.stringify({results:messages}));
    } else if(requestMethod === 'POST') {
      var data = "";
      request.on("data", function(chunk){
        data += chunk;
      });
      request.on('end', function(){
        //writeMessage(data);
        queryInsertMessage(JSON.parse(data), 201, headers, response);
        // statusCode = 201;

        // response.writeHead(statusCode, headers);
        // response.end(JSON.stringify({results:messages}));
      });
    }else if(requestMethod === 'OPTIONS'){
      statusCode = 200;
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify({results:messages}));
    }
  }else if(urlParts.pathname === '/classes/room'){
    if(requestMethod === 'GET') {
      statusCode = 200;

      response.writeHead(statusCode, headers);
      response.end(JSON.stringify({results:rooms}));
    }else if(requestMethod === 'POST') {
      var data = "";
      request.on("data", function(chunk){
        data += chunk;

      });
      request.on('end', function(){

        rooms.push(JSON.parse(data));
        statusCode = 201;

        response.writeHead(statusCode, headers);
        response.end(JSON.stringify({results:rooms}));
      });
    }else if(requestMethod === 'OPTIONS'){
      statusCode = 200;
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify({results:rooms}));
    }
  }else /*if(urlParts.pathname === "/")*/{
    var path = urlParts.pathname === '/' ? '/index.html' : urlParts.pathname;
    console.log("the path: ", path);
    fs.readFile("client" + path, function(err, data){
      if(err){
        statusCode = 404;
        headers['Content-Type'] = "text/html";
        response.writeHead(statusCode, headers);
        response.end("<h1>This page doesn't exist</h1>");
      }

      statusCode = 200;
      var lastThreeChars = path.slice(-3);
      // console.log(lastThreeChars);
      if(lastThreeChars === 'tml'){
        headers['Content-Type'] = "text/html";
      }else if(lastThreeChars === 'css'){
         headers['Content-Type'] = "text/css";
      }else if(lastThreeChars === '.js'){
         headers['Content-Type'] = "text/javascript";
      }else{
        headers['Content-Type'] = "text/plain";
      }

      response.writeHead(statusCode, headers);
      response.end(data);
    });

  }/*else{
    console.log("YAY");
    statusCode = 404;
     response.writeHead(statusCode, headers);
     response.end(JSON.stringify({results:rooms}));
  }*/


    // Tell the client we are sending them plain text.
      //
      // You will need to change this if you are sending something
      // other than plain text, like JSON or HTML.
      // headers['Content-Type'] = "text/plain";

      // .writeHead() writes to the request line and headers of the response,
      // which includes the status and all headers.

      // Make sure to always call response.end() - Node may not send
      // anything back to the client until you do. The string you pass to
      // response.end() will be the body of the response - i.e. what shows
      // up in the browser.
      //
      // Calling .end "flushes" the response's internal buffer, forcing
      // node to actually send all the data over to the client.





};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

module.exports = requestHandler;

