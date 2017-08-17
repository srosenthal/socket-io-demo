var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var aliases = {};

var i = 1;
function randomAlias() {
  var name = 'Dude #' + i;
  i = i + 1;
  return name;
}

io.on('connection', function(socket){
  var assignedAlias = randomAlias();
  aliases[socket.id] = assignedAlias;

  io.emit('alias list', aliases);

  var text = assignedAlias + ' has joined the server';
  console.log(text);
  io.emit('chat message', 'Server', 'Server', text);

  // Confirm the current alias to the client
  socket.emit('alias', assignedAlias);

  socket.on('name change', function(newAlias){
    var oldAlias = aliases[socket.id];
    if (newAlias === 'Server' ||
        newAlias === oldAlias ||
        newAlias.length > 12) {
      // The name Server is reserved, so users can't use it.
      // We could also prevent users from using the same name as someone else.
      newAlias = oldAlias;
    } else {
      var text = oldAlias + ' is now known as ' + newAlias;
      console.log(text);
      aliases[socket.id] = newAlias;
      io.emit('chat message', 'Server', 'Server', text);
      io.emit('alias list', aliases);
    }

    // Confirm the current alias to the client
    socket.emit('alias', newAlias);
  });

  socket.on('chat message', function(msg){
    var alias = aliases[socket.id];
    console.log('[' + alias + ']: ' + msg);
    io.emit('chat message', socket.id, alias, msg);
  });

  socket.on('disconnect', function(){
    var alias = aliases[socket.id];

    var text = alias + ' has disconnected'
    console.log(text);
    io.emit('chat message', 'Server', 'Server', text);
    delete aliases[socket.id];

    io.emit('alias list', aliases);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
