//harvest hashtaged tweets

//test

var MongoClient = require('mongodb').MongoClient;
var twitter = require('twitter');
var _ = require('underscore');

var twit = new twitter({
    consumer_key: 'ZdpUoZCeryIJQ6h8Hwcf9nxgn',
    consumer_secret: 'GpxPvpDhJg1VZV2IOpOCON5MzJagc6Vwn1CPna108qjQB3pfyB',
    access_token_key: '2828310273-QhPxYbnTgXYobDSjPXdS20G8kFYGOAWfJMtIvAL',
    access_token_secret: '51xnPhjS0KcqeiWKFW2IJyeegHhHgtOZLvnthTtEoQJVE'
});


var getTweets = function(searchTerm, sinceId, maxId, callback){
  
  if (typeof maxId == 'function'){
    callback = maxId;
    maxId = null;
  }else{
    maxId = maxId || null;
  }
  
  var params, 
      tweets = [];

  console.log('searching twitter for ', searchTerm, 'between ', sinceId, maxId);
  
  if (maxId != null){
    params = {count:100, since_id: sinceId, max_id: maxId};
  }else{
    params = {count:100, since_id: sinceId};
  }
  
  twit.search(searchTerm, params, function(data){
    var tw = _.toArray(data.statuses);
    tweets = tweets.concat(tw);
    
    if (tw.length == 100 && sinceId != 0){ //only get 100 on first run - i.e. do not go back and get past
      
      var lowestId = _.min(tw, function(t){return t.id_str;}).id_str;
      console.log('lowestId', lowestId);

      getTweets(searchTerm, sinceId, lowestId, function(tw){
        tweets = tweets.concat(tw);
        console.log('tweets length ', tweets.length);
        callback(tweets);
      });

    }else{
      callback(tweets);
    }  
  });
};


var url = 'mongodb://localhost:27017/byelection';

MongoClient.connect(url, function(err, db) {
	
	console.log(err);
  	console.log("Connected to mongo");

  	var tweetCollection = db.collection('tweets');
    var hashtagCollection = db.collection('hashtags');

    
    hashtagCollection.find({}).toArray(function(err, hashtags){
      
      console.log(hashtags);
      if (hashtags.length == 0){
        console.log('no hashtags found to collect');
        db.close();
      }

      var finishedHashtag = _.after(hashtags.length, function(){
        console.log('all hashtags finished closing db connnection');
        db.close();
      });

       _.each(hashtags, function(hashtag){
        //console.log(hashtag);

        tweetCollection.findOne({ $query: {hashtag:hashtag}, $orderby: { id_str : -1 }}, {id_str:true}, function(err, m){
          
        var maxId;
        if (m == null){
          maxId = '0';
        }else{
          maxId = m.id_str;
        }
        
        getTweets(hashtag.tag, maxId, function(tweets) {
          var storedTweets = _.after(tweets.length, function(){
            console.log('stored all tweets ('+tweets.length+') for ', hashtag);
            finishedHashtag();
          });
    
          if (tweets.length == 0){
            console.log('finished hashtag 0 tweets');
            finishedHashtag();
          }

          _.each(tweets, function(t){

            //TO DO - PARSE THE TIMESTAMP INTO A MONGO QUERY_ABLE FORMAT.
           
            t.hashtag = hashtag;
            var d = new Date(t.created_at);
            t.ts = d.toISOString();
            tweetCollection.insert(t, function(err,res){
              storedTweets();
            });
          });
        });
      });
    });
   });
});

