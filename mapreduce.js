// Map reduce simple aggregation jobs

var mapFn = function(){
	this.entities.hashtags.forEach(function(h){
		emit(h.text.toLowerCase(), 1);
	});
}

var redFn = function(hashtag, count){
	return Array.sum(count);
}








function parseTwitterDate(text) {
	return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
}