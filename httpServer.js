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
		hashCol.find({$query:{}, $orderby:{value:-1}}, {limit:req.params.n}, function(err, hash){
			console.log(hash);
			hash.toArray(function(err, results){
				res.setHeader('Content-Type', 'application/json');
				res.send(results);
				db.close();
			});
			
		});
		
	});
});

app.get('hashtaggraph/:n', function(req, res){
	//deliver time / volumes for tweets on the watchlist
	MongoClient.connect(mongoUrl, function(err, db) {
		var hashCol = db.collection('hashtag_totals');

		//try hashCol.find().sort({value:-1}).limit(req.params.n).toArray()
		hashCol.find({$query:{}, $orderby:{value:-1}}, {limit:req.params.n}, function(err, cursor){
			console.log(cursor);
			cursor.toArray(function(err, data){
				//construct query
				var hashtagQueries = [];
				data.forEach(function(h){
					hashtagQueries[] = '{"id_.hashtag":"'+h._id+'"}';
					console.log(hashtagQueries);

				})
				
				var q = "{$or:["+hashtagQueries.join()+"]}";
				// var q = {$or:hashtagQueries};

				var hourly = db.collection('hashtag_by_hour');
				hourly.find($q), function(err, cursor){
					cursor.toArray(function(hashtags){
						res.setHeader('Content-Type', 'application/json');
						res.send(hashtags);
						db.close();
					});
				});
			});
		});
	});
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('http server app listening at http://%s:%s', host, port);


});