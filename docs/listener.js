$(document).ready(function(){
    
    // Paste event
    $("#lcLinks").on("paste",function(){
        var _this = this;
        document.getElementById("error").style.display = "none";
        setTimeout(function(){
            inputWatcher.onStringPaste(_this);
        },150);
    });
    
    // Check if YouTube API key is defined
    if(youTubeContentProvider.apiKey.length == 0) document.querySelector("#ytb-no-key").style.display = "block";
});

var inputWatcher = {
    onStringPaste: function(obj) {
        // Links
         var _links       = LiveContentProvider.helpers.getLinks(obj.value) || [];
        if(_links.length == 0) return false;
        
        document.querySelector("#ytb-no-key").style.display = "none";
        
        this.getData(_links[_links.length - 1]);
    },
    onSuccess: function(data){
        // Calls when data is downloaded successfully
        var templ = "<div class=\"lc-item\"><div class=\"img-wrap\"><img src=\"{{thumb}}\" /></div><div class=\"data\"><a href=\"{{url}}\" target=\"_blank\">{{title}}</a><i>{{description}}</i></div></div>";
        if(data.description.length == 0) data.description = "No description";
        document.getElementById("lcItems").innerHTML += templ
                                                        .replace("{{thumb}}",data.thumb)
                                                        .replace("{{url}}",data.url)
                                                        .replace("{{title}}",data.title)
                                                        .replace("{{description}}",data.description);
    },
    onError: function(response, error){
        // When error
        console.log("Error: ",response,error);
        alert("An error occured - "+error+"\nOpen console for details");
    },
    onLoad:function(){
        // When loading
    },
    getData: function(strurl) {
        var success = false;
        // check if url is suitable for each content provider
        for(var c = 0; c < providers.length; c++) {
            var currentProvider = providers[c],
                uLink           = currentProvider.test(strurl);
            if(uLink != false)
            {
                success = true;
                
                // Call matched content provider
                currentProvider.query
                (
                    uLink,
                    inputWatcher.onSuccess,
                    inputWatcher.onLoad,
                    inputWatcher.onError
                );
                break;
            }
        }
        // Show error if URL is invalid
        if(!success) document.getElementById("error").style.display = "block";

    },
};