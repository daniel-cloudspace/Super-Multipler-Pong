var express = require('express');
var sys = require("sys");
var util = require('util');
var io = require("socket.io");

const DOM_VK = { LEFT:37, UP:38, RIGHT:39, DOWN:40 };

app = express.createServer();

app.listen(80);


app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


var socket = io.listen(app);
var players = {};
var ball = { x:100, y:300, angle: 0.5, speed: 10 };
var event_buffer = {};
var time;
var green_team_score=0, red_team_score=0;

function new_player() {
    var starter_x = ( Math.random() > 0.5 ? 100 : 900 );
    var keystrokes = {};
    keystrokes[DOM_VK.UP] = keystrokes[DOM_VK.DOWN] = keystrokes[DOM_VK.RIGHT] = keystrokes[DOM_VK.LEFT] = false;
    return { x: starter_x, y: 0, updated: false, keystrokes: keystrokes}
}

function adjust_ball_angle(y)  {
  //how big the curve is - how much the ball changes direction
  var curve_scale = 0.01
  // half the paddle size so that when you hit in the center, it is 0 change
  var half_paddle_size = 75
  var curve = ((curve_scale * y * y) + half_paddle_size) / 30000
  return curve
}

function game_tick() {
    ball.x += ball.speed * Math.cos(ball.angle);
    ball.y += ball.speed * Math.sin(ball.angle);
    b = ball.y - Math.tan(ball.angle) * ball.x;

    // animate all players according to their keystrokes
    for (i in players) {
        if (typeof players[i].keystrokes != 'undefined') {
            if (players[i].keystrokes[DOM_VK.UP])    { players[i].y -= ponger_step; }
            if (players[i].keystrokes[DOM_VK.DOWN])  { players[i].y += ponger_step; }
            if (players[i].keystrokes[DOM_VK.RIGHT]) { players[i].x += ponger_step; }
            if (players[i].keystrokes[DOM_VK.LEFT])  { players[i].x -= ponger_step; }
        }
        
        // check for collision with ball
        if (ball.y < players[i].y + 120 && ball.y > players[i].y) {
            var diff = ball.x - players[i].x;
            var y_intersect = Math.tan(ball.angle) * players[i].x + b;
            if (players[i].x < 500 && Math.cos(ball.angle) < 0 && diff > 0 && diff < 10) {
                ball.angle = Math.PI - ball.angle + adjust_ball_angle(y_intersect);
                ball.x = players[i].x + diff;
            } else if (players[i].x > 500 && Math.cos(ball.angle) > 0 && diff > -10 && diff < 0) {
                ball.angle = Math.PI - ball.angle + adjust_ball_angle(y_intersect);
                ball.x = players[i].x - diff;
            }
        }
    }

    if (ball.y < 0) {
        ball.angle = 0 - ball.angle;
        ball.y = Math.abs(ball.y);
    } else if (ball.y > 500) {
        ball.angle = 0 - ball.angle;
        ball.y = 1000 - ball.y;
    }
    if (ball.x < 0) {
        ball.angle = Math.PI - ball.angle;
        ball.x = Math.abs(ball.x);
        // Green team scores
        green_team_score += 1;
        socket.broadcast({ score: { green: green_team_score, red: red_team_score }});
    } else if (ball.x > 1000) {
        ball.angle = Math.PI - ball.angle;
        ball.x = 2000 - ball.x;
        // Red team scores
        red_team_score += 1;
        socket.broadcast({ score: { green: green_team_score, red: red_team_score }});
    }
}

socket.on('connection', function(client) {

  players[client.sessionId] = new_player(); 

  client.send({ 
    init_data: { 
        your_id: client.sessionId, 
        your_player: players[client.sessionId], 
        ball: ball, 
        server_time: new Date().getTime(), 
        players: players, 
        score: { 
            green: green_team_score, 
            red: red_team_score 
        } 
    } 
  });

  client.on('message', function(message){
     if ( typeof players[message.my_id] != 'undefined' ) {
        event_buffer[message.my_id] = message.the_event;
        players[message.my_id].x = message.the_event.x;
        players[message.my_id].y = message.the_event.y;
        players[message.my_id].keystrokes[DOM_VK.UP] = message.the_event.keystrokes[DOM_VK.UP];
        players[message.my_id].keystrokes[DOM_VK.DOWN] = message.the_event.keystrokes[DOM_VK.DOWN];
        players[message.my_id].keystrokes[DOM_VK.LEFT] = message.the_event.keystrokes[DOM_VK.LEFT];
        players[message.my_id].keystrokes[DOM_VK.RIGHT] = message.the_event.keystrokes[DOM_VK.RIGHT];
    }
  });

  client.on('disconnect', function(){ 
    sys.puts("client disconnected: "+client.sessionId);
    socket.broadcast({ player_disconnected: client.sessionId });
    delete players[client.sessionId];
  });
});

var count=0;
var time = new Date().getTime();
var ponger_step = 10, half_window = 500;
setInterval(function() {
    // this is basically: if event_buffer is not empty:
    for (i in event_buffer) {
        var update_data = { time: new Date().getTime(), events: event_buffer };
        if (count%10) update_data.ball = ball;
        socket.broadcast(update_data);
        event_buffer = {};
        break;
    }

    game_tick();

    count = count +1;
}, 30);

var stdin = process.openStdin();
stdin.on('data', function(chunk) { socket.broadcast({ injection: chunk + '' }); });
