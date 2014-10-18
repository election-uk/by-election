//harvest hashtaged tweets

var MongoClient = require('mongodb').MongoClient;
var twitter = require('twitter');
var _ = require('underscore');

var twit = new twitter({
    consumer_key: 'ZdpUoZCeryIJQ6h8Hwcf9nxgn',
    consumer_secret: 'GpxPvpDhJg1VZV2IOpOCON5MzJagc6Vwn1CPna108qjQB3pfyB',
    access_token_key: '2828310273-QhPxYbnTgXYobDSjPXdS20G8kFYGOAWfJMtIvAL',
    access_token_secret: '51xnPhjS0KcqeiWKFW2IJyeegHhHgtOZLvnthTtEoQJVE'
});

var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
	
	console.log(err);
  	console.log("Connected to mongo");

  	var tweetCollection = db.collection('tweets');
    var hashtagCollection = db.collection('hashtags');

    //get max id

   tweetCollection.findOne({ $query: {}, $orderby: { id_str : -1 }}, {id_str:true}, function(err, m){
    var maxId = m.id_str;
    console.log('maxId', maxId);
      hashtagCollection.find({}).toArray(function(err, hashtags){
      console.log(hashtags);
       _.each(hashtags, function(hashtag){
        //console.log(hashtag);
        console.log('searching twitter for', hashtag.tag)
        twit.search(hashtag.tag, {count:100, since_id: maxId}, function(data) {
          //console.log(typeof data.statuses);
          console.log(data.statuses);
          _.each(data.statuses, function(d){
            console.log('inserting', d.text);
            tweetCollection.insert(d, function(err,res){
              console.log('insert', err);
            });
          })
        
        });
      

      });
      //db.close();

    });

   });
    

    
    //console.log(hashtags);
   



});

