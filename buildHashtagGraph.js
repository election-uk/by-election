
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;

var arrayToPairs = function(ar){

	//console.log(ar);
	//do alpha sort on lowercased array

	alphaAr = _.sortBy( _.map(ar, function(a){ return a.toLowerCase(); }) );
	//console.log(alphaAr);

	var op = [];
	// pop off first element & run through next ones - then iterate (maybe recursive?)

	while (alphaAr.length > 1){
		var h1 = alphaAr.shift();
		_.each(alphaAr, function(hashtag){
			op.push({h1:h1, h2:hashtag});
		});
	}

	return op;
}


console.log( arrayToPairs(['Dave', 'jim', 'clive', 'bob', 'RICHARD']) );
console.log( arrayToPairs(['c', 'a', 'b', 'd']) );

var url = 'mongodb://localhost:27017/byelection';

MongoClient.connect(url, function(err, db) {
	console.log('connected to Mongo');

	var tweetCollection = db.collection('tweets');

	tweetCollection.find({}, {'entities.hashtags.text':true}).toArray(function(err, data){
		console.log('db err is ', err);
		//console.log('got data ', data);
		var hashtagPairs = [];
		_.each(data, function(tweet){
			var hashtags = _.pluck(tweet.entities.hashtags, 'text');
			if (hashtags.length > 1){
				hashtagPairs = hashtagPairs.concat( arrayToPairs(hashtags) );
			}
			
		});
		//console.log(hashtagPairs);

		// reduce the pairs to counts
		/*
		var output = _.map( _.uniq(hashtagPairs), function(p){
			p.count = 1;
			return p;
		});
		*/
		var output = _.uniq(hashtagPairs, function(p){
			return p.h1+':::'+p.h2;
		});

		//console.log(output);
		var totalTweets = data.length;
		_.each(output, function(pair){
			var count = _.filter(hashtagPairs, function(p){
				return (p.h1 == pair.h1 && p.h2 == pair.h2);
			}).length;
			pair.count = count;
			pair.pairProb =  count/data.length;
		});

	
		var pairings = _.sortBy(output, function(p){
			return p.pairProb;
		});

		_.each(pairings, function(p){
			console.log( p.h1+' :: '+p.h2, p.pairProb);
		});

		db.close();


	});





});
