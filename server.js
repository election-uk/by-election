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
    //TODO deal with duplication

    if (tw.length == 100){
      //need to go get more - prob need a max number of iterations though??

       //get lowest id
      var lowestId = _.min(tw, function(t){return t.id_str;}).id_str;
      console.log('lowestId', lowestId);

      getTweets(searchTerm, sinceId, lowestId, function(tw){
        tweets = tweets.concat(tw);
        console.log('tweets length ', tweets.length);
        callback(tweets);
      });

    }else{
      //invoke callback
      console.log('invoking callback')
      callback(tweets);
    }
   
    //TODOadd recursion

    
    
  });
};


var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
	
	console.log(err);
  	console.log("Connected to mongo");

  	var tweetCollection = db.collection('tweets');
    var hashtagCollection = db.collection('hashtags');

    
      hashtagCollection.find({}).toArray(function(err, hashtags){
      console.log(hashtags);

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
            console.log('sotred all tweets for ', hashtag);
            finishedHashtag();
          });
          //console.log(typeof data.statuses);
          console.log('got ',tweets.length, 'tweets');

          if (tweets.length == 0){
            console.log('finished hashtag 0 tweets');
            finishedHashtag();
          }
          _.each(tweets, function(t){
            //console.log('inserting', t.text);
            t.hashtag = hashtag;
            tweetCollection.insert(t, function(err,res){
              //console.log('insert', err);
              storedTweets();
            });
          })
        
        });
      

      });
      //db.close();

    });

   });
    

    
    //console.log(hashtags);
   



});

