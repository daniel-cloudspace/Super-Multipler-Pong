# Super Multipler Pong
This is a bad name. Give me a new one?

## Introduction

After seeing (and gaming) the MMORPP project that was written in NodeJS, I wanted to play with this new funky language. Obviously, the first game you make in a new language is Pong. But how do you write Pong to take advantage of the beautiful anonymous-massive-multiplier capabilities of NodeJS and Socket.IO?

The goal of the game is to hit the pong ball with your pongers into the other team’s goal. But wait, how do you deal with anonymous users? Let them be anonymous! Well, if they cross the middle of the game field, they become a part of the new team! Oh!… but how do you stop people from cheating and just bulldozing the other team? Easy! You make it so pong balls can’t bounce off the backs of paddles, ever!

So, in this variation of Pong, you can have more than 2 players, and you can choose to join the winning team at the last second, making winning unimportant! Not that you were ever going to see any of these people ever again :). It’s anonymous!

## Public Demo

I have a public demo set up on an EC2 instance at http://174.129.178.244/it.html

## Installation & Setup

If you'd like to install this game on your local computer and test it:

- install NodeJS
wget http://nodejs.org/dist/node-v0.4.8.tar.gz -qO - | tar -zx
cd node-v0.4.7
./configure
make
sudo make install
- install NPM (the Node Package Manager)
curl http://npmjs.org/install.sh | sudo sh
- install the Express and Socket.IO packages with npm
sudo npm install express
sudo npm install socket.io
- clone this project
git clone git://github.com/daniel-cloudspace/Super-Multipler-Pong.git
- run the server
cd Super-Multipler-Pong && sudo node server.js
- open a decent web browser and go to:
http://localhost:8080/it.html

And that should work!
