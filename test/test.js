
var log = function(m) {
    if ( typeof window.console === "object" && typeof console.log === "function" ) {
        var type = typeof m;
        if ( type === "string" || type === "number") {
            m = $.Class.log_prefix + m;
        }
        console.log(m);
    }
    return m;
}, ID = "47piCmAB0s4", IID = "ui",
SRC = "http://www.youtube.com/embed/47piCmAB0s4?autohide=0&autoplay=0&enablejsapi=0&version=4&hd=1&disablekb=0&showinfo=0&";

module(_m+$.youtube.VIDEO);

$.extend($.youtube._config, {
    videoType: $.youtube.IFRAME,
    width: 200,
    height: 150,
    id: ID,
    name: "name"
});

test("Config", function() {
    expect(3);
    
    var config = $.youtube.config(), org_hd = config.hd, n = "11111";
    
    config.hd = n;
    ok($.youtube._config.hd != n, "Make sure $.youtube.config() is passing a copy of the config");
    
    ok($.youtube.config("hd") === $.youtube._config.hd, "");
    
    $.youtube.config("hd", n);
    ok($.youtube.config("hd") === n && $.youtube._config.hd === n, "");
    
    $.youtube._config.hd = org_hd;
});

test("Build a valid iframe element", function() {
    expect(6);
  
    var data = $.youtube.config();
    
    var e = $.youtube.video(data);
  
    $.each({
        localName: "iframe",
        width: "200", 
        height: "150",
        title: "name", 
        type: "text/html",
        src: SRC
    }, function(k,v){
        equals(e[0][k], v, "Check: "+k);
    });
});

test("Build a valid object element", function() {
    expect(13);
    var data = $.youtube.config();
    
    data.videoType = $.youtube.OBJECT;
    
    var e = $.youtube.video(data);
    
    $.each({
        localName: "object",
        width: "200", 
        height: "150"
    }, function(k,v){
        equals(e[0][k], v, "Check: "+k+" at the <object>");
    });
    
    var c = e.children();
    
    c.each(function(){
        switch(this.name) {
            case "allowFullScreen":
            case "allowscriptaccess":
                equals(this.localName, "param");
                equals(this.value, "true");
                break;
            case "movie":
                equals(this.localName, "param");
                equals(this.value, "http://www.youtube.com/v/47piCmAB0s4?autohide=0&autoplay=0&enablejsapi=0&version=4&hd=1&disablekb=0&showinfo=0&?fs=1&amp;hl=en_US&amp;rel=0");
                break;
            default:
                if ( this.localName != "embed" ) {
                    ok(false, "invalid element in the <object> localName="+this.localName);
                    break;
                }
                equals(this.src, "http://www.youtube.com/v/47piCmAB0s4?autohide=0&autoplay=0&enablejsapi=0&version=4&hd=1&disablekb=0&showinfo=0&?fs=1&amp;hl=en_US&amp;rel=0", "src on the embed element");
                equals(this.type, "application/x-shockwave-flash", "type on the embed element");
                equals(this.width, "200", "width on the embed element");
                equals(this.height, "150", "height on the embed element");
                break;
        }
    });
    
});

test("Youtube object maintenance", function() {
    
    var e = $("<a />").youtube($.youtube.VIDEO);
    
    var c = $.data(e[0], $.youtube.DATA_ID),t;
    c.__check = true;
    
    e.youtube($.youtube.VIDEO);
    c = $.data(e[0], $.youtube.DATA_ID);
    
    ok(c.__check);
    
    e.youtube($.youtube.IMAGE);
    c = $.data(e[0], $.youtube.DATA_ID);
    
    ok(c.__check);
    ok(c.type === $.youtube.IMAGE);
    
    e.youtube({id:"t_hR5KNdPEA"});
    c = $.data(e[0], $.youtube.DATA_ID);
    
    ok(c.__check);
    ok(c.config.id === "t_hR5KNdPEA");
    
    e.youtube($.youtube.VIDEO);
    c = $.data(e[0], $.youtube.DATA_ID);
    
    ok(c.__check);
    ok(c.type === $.youtube.VIDEO);
    
    e.youtube({
        id:ID,
        videoType: t = (c.config.videoType === $.youtube.OBJECT ? $.youtube.IFRAME : $.youtube.OBJECT)
    });
    
    c = $.data(e[0], $.youtube.DATA_ID);
    
    ok(c.__check);
    ok(c.config.id === ID);
    ok(c.config.videoType === t);
    
    var old_width = c.config.width;
    e.youtube({
        width: old_width+5
    });
    
    c = $.data(e[0], $.youtube.DATA_ID);
    
    ok(c.__check);
    ok(c.config.id === ID);
    ok(c.config.width === old_width+5);
    
    var old_height = c.config.height;
    e.youtube({
        height: old_height+5
    });
    
    c = $.youtube.get(e);
    
    ok(c.__check);
    ok(c.config.id === ID);
    ok(c.config.height === old_height+5);
    
});

module(_m+$.youtube.IMAGE);
