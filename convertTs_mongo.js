
tw = db.tweets.find().limit(10);
tw.forEach(function(t){
	var d = new Date(t.created_at);
	t.ts = d.toISOString();
	print(t.ts);
	db.tweets.update( { _id: t._id }, t);
});