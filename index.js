var http = require('http');

http.createServer(function() {
	console.log(arguments.length);

}).listen( process.env.PORT || 8000);