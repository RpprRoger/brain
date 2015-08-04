var cssConcat = require('css-concat');
var express = require('express');
var browserify = require('browserify');
var md5 = require('md5');
var send = require('send');
var url = require('url');
var path = require('path');
var compression = require('compression');
var isImage = require('is-image');

var clientJS = './client/client.js';
var clientCSS = './client/client.css';
var index = './client/client.html';

var client = browserify({
	debug: process.env.NODE_ENV !== 'production'
});
client.add(clientJS);

var css = new Buffer(cssConcat.concat(clientCSS));
console.log('bundled css');

var app = express();

app.use(compression());

var public = path.resolve(__dirname, 'client');

client.bundle(function(err, buf) {
	if(err) {
		throw err;
	}
	console.log('bundled javascript');
	// yay magic cache busting
	var JSETag = md5(buf);
	var CSSETag = md5(css);

	app.use(function(req, res, next) {
		var request = url.parse(req.url).pathname;
		if(request !== '/bundle.css' && request !== '/bundle.js') {
			if(isImage(request)) {
				console.log('returning data for: %s from %s', request, public);
				send(req, request, {root: public}).pipe(res);
			} else {
				console.log('serving client for request:', request);
				send(req, index).pipe(res);
			}
			return;
		}

		next();
	});

	app.get('/bundle.css', function (req, res) {
		res.status(200);
		res.set({
			'Content-Type': 'text/css',
			'Content-Length': css.length,
			'ETag': CSSETag
		});
		res.end(css);
	});

	app.get('/bundle.js', function (req, res) {
		res.status(200);
		res.set({
			'Content-Type': 'text/javascript',
			'Content-Length': buf.length,
			'ETag': JSETag
		});
		res.end(buf);
	});

	var server = app.listen(3000, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
	});
});

