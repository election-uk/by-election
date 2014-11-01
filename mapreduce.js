// Map reduce simple aggregation jobs

var mapFn = function(){
	var hour = this.ts.substr(0,13)+'00:00.000Z';
	this.entities.hashtags.forEach(function(h){
		emit({hour: hour , hashtag: h.text.toLowerCase()}, 1);
	});
}

var redFn = function(hashtag, count){
	return Array.sum(count);
}

// run the job ebery hour to populate an hour by hour table
// at the same time inremenatlly run a m/r for a totals table



