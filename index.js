var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var aliases = {};

var i = 1;
function randomName() {
  var name = 'Duder #' + i;
  i = i + 1;
  return name;
}

io.on('connection', function(socket){
  var alias = aliases[socket.id] = randomName();
  console.log('user connected: ' + alias);

  // Confirm the current alias to the client
  socket.emit('alias', alias);

  socket.on('name change', function(msg){
    var alias = aliases[socket.id];
    console.log('name change from ' + alias + ': ' + msg);
    aliases[socket.id] = msg;
    io.emit('name change', msg);
  });

  socket.on('chat message', function(msg){
    var alias = aliases[socket.id];
    console.log('message from ' + alias + ': ' + msg);
    io.emit('chat message', '[' + alias + ']: '+ msg);
  });

  socket.on('disconnect', function(){
    var alias = aliases[socket.id];
    console.log('user disconnected: ' + alias);
    delete aliases[socket.id];
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
