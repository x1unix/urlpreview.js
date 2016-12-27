/**
 * <b>LiveContentProvider</b> object allows to receive data and work with REST services such as YouTube, Vimeo and etc.
 * <i>Create a new copy of LiveContentProvider.</i>
 * @param matchIndex arrayIndex Of matches
 * @param servicePath Path to remote service
 * @author Denis Sedchenko [odin3]
 * @version 1.0
 * @param apiKey Service API Key <u>[optional]</u>
 * @constructor
 */
function LiveContentProvider(matchIndex,servicePath,apiKey) {

/**
 * private apiKey
 */
	this.apiKey = apiKey ||"";
	this.matchIndex = matchIndex;

    /**
     * Link to service API URL
     */
    this.servicePath = servicePath;

    /**
     * List of regexp's to filter queries
     * @type {Array}
     */
	this.regexps = [];

    /**
     * List of events
     * @type {{}}
     */
	this.events = {};

    /**
     * Priority
     * @type {number}
     */
	this.priority = 0;

    /**
     * Data cache
     * @type {{}}
     */
	this.dataBuffer = {};

	this.itemValid = false;
	

	/**
	 * Add RegExp filtration patterns to provider
	 * @param {array} patterns list of RegExp's
	 */
	this.setPatterns = function(patterns) {
		this.regexps = patterns;
		return this;
	};

    /**
     * Adds an event listener
     * @param iEvent
     * @param iFunc
     * @returns {LiveContentProvider}
     */
	this.on = function(iEvent,iFunc){
		this.events[iEvent] = iFunc;
		return this;
	};

    /**
     * Add a new pattern to regexp filter
     * @param pattern
     * @returns {LiveContentProvider}
     */
	this.addPattern = function(pattern) {
		this.regexps.push(pattern);
		return this;
	};

    /**
     * Get formatted query url
     * @param target
     * @returns {string|XML}
     */
	this.getQueryURL = function(target) {
		return this.servicePath
					.replace("{{target}}", encodeURIComponent(target))
					.replace("{{apiKey}}",this.apiKey);
	};
	/**
	 * Add API Key
	 * @param {string} q Service API KEY
	 */
	this.setKey = function(q) {
		this.apiKey = q;
		return this;	
	};
	
	
	/**
	 * Triggers when REST data received
	 * @param  {object} result JSON result
	 */
	this.onQueryFinished = function(result) {
		return result;
	};
	
	/**
	 * Fetch data from REST service
	 * @param  {string} dURL target URL
	 */
    this.query = function(dURL,onSuccess,onLoad,onFail) {
        if(!isset(onSuccess)) onSuccess = function(){};
        if(!isset(onLoad)) onLoad = function(){};
        if(!isset(onFail)) onFail = function(){};

        var _self = this,
			_queryURL = this.getQueryURL(dURL);
            onLoad();
        try{

			$.get(_queryURL,function(restResponce){
                if(isset(_self.events["dataReceived"])) restResponce = _self.events["dataReceived"](restResponce);

				if(_self.events["queryValidate"](restResponce) == true) {
					onSuccess(_self.events["queryValidated"](restResponce));
					return true;
				}else{
					if(isset(_self.events["queryFailed"])) {
						 _self.events["queryFailed"](restResponce,"QueryValidationFailed");

					}
                    onFail(restResponce,"QueryValidationFailed");
					return false;
				}
			}).fail(function(restResponce){
				_self.events["queryFailed"](restResponce,"QueryGetFailed");
                onFail(restResponce,"QueryGetFailed");
			});
		} catch(ex) {
			_self.events["queryFailed"](restResponce,"QueryGetFailed");
            onFail(restResponce,"QueryGetFailed");
			return false;
		}
    };

    /**
     * Triggers when job is finished
     */
	this.on("jobFinished",function(e){
		this.dataBuffer = {};
		this.itemValid = false;
	});


    /**
     * Test Value for regexp
     * @param strurl Value
     * @returns {*}
     */
	this.test = function(strurl) {
		for(var _reg = 0; _reg < this.regexps.length; _reg++) {
			if(this.regexps[_reg].test(strurl) == true) {
				var _results = strurl.match(this.regexps[_reg]);
				return _results[this.matchIndex]; 
			}
		}
		return false;	
	};
	
	
	
	
}

/**
 * Some URL Helpers
 */
LiveContentProvider.helpers = {
		 UriParser :  function (uri)
			{
				this._regExp      = /^((\w+):\/\/\/?)?((\w+):?(\w+)?@)?([^\/\?:]+)?(:\d+)?(.*)?/;
				this._regExpHost  = /^(.+\.)?(.+\..+)$/;
		
				this._getVal = function(r, i)
				{
					if(!r) return null;
					return (typeof(r[i]) == 'undefined' ? "" : r[i]);
				};
		
				this.parse = function(uri)
				{
					var r          = this._regExp.exec(uri);
					this.results   = r;
					this.url       = this._getVal(r,1);
					this.protocol  = this._getVal(r,2);
					this.username  = this._getVal(r,4);
					this.password  = this._getVal(r,5);
					this.domain    = this._getVal(r,6);
					this.port      = this._getVal(r,7);
					this.path      = this._getVal(r,8);
		
					var rH         = this._regExpHost.exec( this.domain );
					this.subdomain = this._getVal(rH,1);
					this.domain    = this._getVal(rH,2);
					return r;
				};
		
				if(uri) this.parse(uri);
			},
			getLinks : function(text)
			{
				var expression = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
				return (text.match(expression));
			},
			isImage : function(img, allowed)
			{
				//Match jpg, gif or png image
				if (allowed == null)  allowed = 'jpg|gif|png|jpeg';
		
				var expression = /([^\s]+(?=\.(jpg|gif|png|jpeg))\.\2)/gm;
				return (img.match(expression));
			},
			isAbsolute : function(path)
			{
				var expression = /^(https?:)?\/\//i;
				var value =  (path.match(expression) != null) ? true: false;
		
		
				return value;
			},
			isPathAbsolute : function(path)
			{
				if (path.substr(0,1) == '/') return true;
			},
			hasParam : function(path)
			{
				return (path.lastIndexOf('?') == -1 ) ? false : true;
			},
			stripFile : function(path) {
				return path.substr(0, path.lastIndexOf('/') + 1);
			}
	 }
/**
 * Check if variable is defined
 * 
 * @param variable Variable
 */
function isset(variable) {
    return typeof variable !== 'undefined' || variable !== undefined;
}