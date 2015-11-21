/**
 * This file contains a collection of LiveContentProviders
 * that returns the data with unified format from remote services
 * (YouTube, Vimeo)
 */
var providers = [];

/**
 * YouTube Content Provider
 * @type {LiveContentProvider}
 */

var youTubeContentProvider = new LiveContentProvider(
	// Which element will be extracted from regexp test
	1,
	// String template
	"https://www.googleapis.com/youtube/v3/videos?id={{target}}&key={{apiKey}}&part=snippet,contentDetails,statistics,status",
	// Youtube API Key
	""
	);

youTubeContentProvider.setPatterns([
	// RegExp patterns to test a request string before performing query 
	/[http|https]+:\/\/(?:www\.|)youtube\.com\/watch\?(?:.*)?v=([a-zA-Z0-9_\-]+)/i,
	/[http|https]+:\/\/(?:www\.|)youtube\.com\/embed\/([a-zA-Z0-9_\-]+)/i,
	/[http|https]+:\/\/(?:www\.|)youtu\.be\/([a-zA-Z0-9_\-]+)/i
]).on("queryValidate",function(q){
	
	// Factory that provides if received query is correct
	return q.items.length == 1;
}).on('queryFailed', function(e,reason){
	
	// If error is received
    console.error("Query failed: "+reason,e);
}).on('queryValidated', function(e){
	
	// When query url and result are valid
	var _item = e.items[0];
	
	// Format a unified answer
	this.dataBuffer = {
		id:				_item.id,
		title:			_item.snippet.title,
		description: 	_item.snippet.description,
        url:            "http://youtu.be/"+_item.id,
        thumb:			"http://i.ytimg.com/vi/"+_item.id+"/hqdefault.jpg",
		type:			"video",
		origin:			_item
	};
	
	console.log(this.dataBuffer);
	return this.dataBuffer;
});

// Add provider to array
providers.push(youTubeContentProvider);



/**
 * Vimeo Content Provider
 * @type {LiveContentProvider}
 */
var vimeoContentProvider = new LiveContentProvider(1,"http://vimeo.com/api/v2/video/{{target}}.json");

vimeoContentProvider.setPatterns([
		/[http|https]+:\/\/(?:www\.|)vimeo\.com\/([a-zA-Z0-9_\-]+)(&.+)?/i,
        /[http|https]+:\/\/player\.vimeo\.com\/video\/([a-zA-Z0-9_\-]+)(&.+)?/i
]).on("queryValidate",function(q){
	return isset(q[0]);
}).on('queryFailed', function(e,reason){
    console.error("Query failed: "+reason,e);
		
}).on('queryValidated', function(e){
	
	var _item = e[0];
	this.dataBuffer = {
		id:				_item.id,
		title:			_item.title,
		description: 	_item.tags,
		thumb:			_item.thumbnail_large,
        url:            "http://vimeo.com/"+_item.id,
		type:			"video",
		origin:			_item
	};
	
	console.log(this.dataBuffer);
	return this.dataBuffer;
});
providers.push(vimeoContentProvider);


