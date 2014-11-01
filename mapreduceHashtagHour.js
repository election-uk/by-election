// Map reduce hashtags per hour - run hourly 
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/byelection';

MongoClient.connect(url, function(err, db) {

	var mrOutput = db.collection('hashtag_by_hour');
	mrOutput.findOne({ $query: {}, $orderby: { '_id.hour' : -1 }}, {'_id.hour':true}, function(err, lastMr){
		console.log('err', err);
		console.log('lastMr', lastMr._id.hour);

		var query = '{ts: {$gt: lastMr._id.hour}}';

		console.log ('query ', query);
		var mapFn = function(){
			var hour = this.ts.substr(0,13)+':00:00.000Z';
			this.entities.hashtags.forEach(function(h){
				emit({hour: hour , hashtag: h.text.toLowerCase()}, 1);
			});
		};

		var redFn = function(hashtag, count){
			return Array.sum(count);
		};

		var MR = {
		      mapreduce: "tweets", 
		      out:  { reduce : 'hashtag_by_hour' },
		      //query: query,
		      map: mapFn.toString(),
		      reduce: redFn.toString()
		};

		db.executeDbCommand(MR, function(err, dbres) {
			  console.log('err', err);
		      var results = dbres.documents[0].results
		      console.log("executing map reduce, results:")
		      console.log(JSON.stringify(results))
		      process.exit(1)
  		});






	})
         

});

//get the last hour we did a map reduce for



//if there isnt one then we'll map reduce the whole lot






// run the job ebery hour to populate an hour by hour table
// at the same time inremenatlly run a m/r for a totals table




