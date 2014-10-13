var MongoClient = require('mongodb').MongoClient;
var twitter = require('twitter');

var twit = new twitter({
    consumer_key: 'ZdpUoZCeryIJQ6h8Hwcf9nxgn',
    consumer_secret: 'GpxPvpDhJg1VZV2IOpOCON5MzJagc6Vwn1CPna108qjQB3pfyB',
    access_token_key: '2828310273-QhPxYbnTgXYobDSjPXdS20G8kFYGOAWfJMtIvAL',
    access_token_secret: '51xnPhjS0KcqeiWKFW2IJyeegHhHgtOZLvnthTtEoQJVE'
});

twit.stream('public', {track:'fgw'}, function(stream) {
    stream.on('data', function(data) {
        console.log(data);
    });
    // Disconnect stream after five seconds
    setTimeout(stream.destroy, 5000);
});

var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
	
	console.log(err);
  	console.log("Connected correctly to server");

  	var collection = db.collection('test');

  	collection.insert([{id: 1, tweet:'hello'}, {id:2, tweet:'world'}], function(err, result){
  		console.log(result);
 	
  		collection.find({tweet:'world'}).toArray(function(err, docs) {
	    	console.log('search results');
	    	console.log(err);
	    	console.log(docs);

	    	console.log('closing db connection');
  			db.close();
    	
  		}); 

 	});

  	
  
  

});