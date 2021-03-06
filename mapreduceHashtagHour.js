// Map reduce hashtags per hour - run hourly 
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/byelection';

MongoClient.connect(url, function(err, db) {

	var mrOutput = db.collection('hashtag_by_hour');
	mrOutput.findOne({ $query: {}, $orderby: { '_id.hour' : -1 }}, {'_id.hour':true}, function(err, lastMr){
		console.log('err', err);
		//console.log('lastMr', lastMr._id.hour);

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
		      out:  'hashtag_by_hour',
		      map: mapFn.toString(),
		      reduce: redFn.toString()
		};

		console.log(JSON.stringify(MR));

		db.executeDbCommand(MR, function(err, dbres) {
			  console.log('err', err);
		      
		      console.log("executed hashtag_per_hour map reduce, results:")
;		      console.log(JSON.stringify(dbres));
			
				// now reduce that again to count the hashtag totals.
				var mapFn = function(){
					emit(this._id.hashtag, this.value);
				};
				var redFn = function(hashtag, count){
					return Array.sum(count);
				};

				db.executeDbCommand({
					mapreduce: 'hashtag_by_hour',
					out: 'hashtag_totals',
					map: mapFn.toString(),
					reduce: redFn.toString(),
				}, function(err,dbres){
					console.log('err', err);
					console.log("executed totals map reduce, results:")
;		      		console.log(JSON.stringify(dbres));
					db.close();
				});

		      
  		});






	})
         

});

//get the last hour we did a map reduce for



//if there isnt one then we'll map reduce the whole lot






// run the job ebery hour to populate an hour by hour table
// at the same time inremenatlly run a m/r for a totals table




