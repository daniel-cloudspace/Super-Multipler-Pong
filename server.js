var express = require('express');
var sys = require("sys");
var util = require('util');
var io = require("socket.io");


app = express.createServer();

app.listen(8080);


app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


var socket = io.listen(app);
var players = {};
var event_buffer = {};

socket.on('connection', function(client) {
  client.send({ init_data: { your_id: client.sessionId } });

  client.on('message', function(message){
    event_buffer[message.my_id] = message.the_event;
    console.log(util.inspect(message));
  });

  client.on('disconnect', function(){ sys.puts("client disconnected"); });
});

setInterval(function() {
    socket.broadcast(event_buffer);
    event_buffer = {};
}, 50);
