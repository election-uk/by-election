//web server stuff
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var mongoUrl = 'mongodb://localhost:27017/byelection';




app.use(express.static(__dirname + '/public'));

app.get('/hw', function (req, res) {
  res.send('Hello Zak & Jim');
});

app.get('/zak', function (req, res) {
  res.send('Hello Zak - You rock');
});

app.get('/tophashtags/:n', function(req, res){
	//res.send('Top Hastags.. '+req.params.n);
	MongoClient.connect(mongoUrl, function(err, db) {
		var hashCol = db.collection('hashtag_totals');
		//try hashCol.find().sort({value:-1}).limit(req.params.n).toArray()
		hashCol.find().sort({value:-1}).limit(parseInt(req.params.n)).toArray(function(err, data){

			//console.log(hash);
			
			res.setHeader('Content-Type', 'application/json');
			res.send(data);
			db.close();
			
			
		});
		
	});
});

app.get('/hashtaggraph/:n', function(req, res){
	//deliver time / volumes for tweets on the watchlist
	console.log('hashtag graph');


	MongoClient.connect(mongoUrl, function(err, db) {
		var hashCol = db.collection('hashtag_totals');
		var hourly = db.collection('hashtag_by_hour');

		hashCol.find().sort({value:-1}).limit(parseInt(req.params.n)).toArray(function(err, data){
			
			console.log(data);
			var hashtagQueries = [];
			data.forEach(function(h){
				hashtagQueries.push({"_id.hashtag":h._id});
			});
			//console.log(hashtagQueries);
			//ar q = "{$or:["+hashtagQueries.join()+"]}";
			var q = {$or:hashtagQueries};
			//var q = {"_id.hashtag":"ukip"};
			//console.log(q);
			
			hourly.find(q).toArray(function(err, data){
					console.log('data',data);

					res.setHeader('Content-Type', 'application/json');
					res.send(data);
					db.close();
				
			});
			
		});
	});
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('http server app listening at http://%s:%s', host, port);


});