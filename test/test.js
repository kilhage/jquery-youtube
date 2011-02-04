
window.log = function(m) {
    if ( typeof window.console === "object" && typeof console.log === "function" ) {
        console.log(m);
    }
    return m;
}
var ID = "47piCmAB0s4",
IID = "ui",
SRC = "http://www.youtube.com/embed/47piCmAB0s4?autohide=0&autoplay=0&enablejsapi=0&version=4&hd=1&disablekb=0&showinfo=0&";

module( _m + $.youtube.VIDEO);

$.youtube._config.videoType = $.youtube.IFRAME;

function setupConfig(){
    return $.extend($.youtube.config(), {
        width: "200",
        height: "150",
        id: ID,
        name: "name"
    });
}

test("Config", function() {
    expect(4);
    
    var config = $.youtube.config(), org_hd = config.hd, n = "11111";

    ok(typeof config === "object", "valid config");
    
    config.hd = n;
    ok($.youtube._config.hd != n, "Make sure $.youtube.config() is passing a copy of the config");
    
    ok($.youtube.config("hd") === $.youtube._config.hd, "");
    
    $.youtube.config("hd", n);
    ok($.youtube.config("hd") === n && $.youtube._config.hd === n, "");
    
    $.youtube._config.hd = org_hd;
});

test("Build a valid iframe element", function() {
    expect(6);
  
    var data = setupConfig();
    
    var e = $($.youtube.video(data));
  
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
    var data = setupConfig();
    
    data.videoType = $.youtube.OBJECT;
    
    var e =$($.youtube.video(data));
    
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
    expect(17);
    
    var config = setupConfig();
    config.type = $.youtube.VIDEO;
    var e = $("<a />").youtube(config);
    
    var c = $.youtube.get(e),
        t;
    ok(typeof c === "object");
    c.__check = true;
    
    e.youtube($.youtube.VIDEO);
    c = $.youtube.get(e);
    
    ok(c.__check);
    
    e.youtube($.youtube.IMAGE);
    c = $.youtube.get(e);
    
    ok(c.__check);
    ok(c.type === $.youtube.IMAGE);
    
    e.youtube({id:"t_hR5KNdPEA"});
    c = $.youtube.get(e);
    
    ok(c.__check);
    ok(c.config.id === "t_hR5KNdPEA");
    
    e.youtube($.youtube.VIDEO);
    c = $.youtube.get(e);
    
    ok(c.__check);
    ok(c.type === $.youtube.VIDEO);
    
    e.youtube({
        id:ID,
        videoType: t = (c.config.videoType === $.youtube.OBJECT ? $.youtube.IFRAME : $.youtube.OBJECT)
    });
    
    c = $.youtube.get(e);
    
    ok(c.__check);
    ok(c.config.id === ID);
    ok(c.config.videoType === t);
    
    var old_width = c.config.width;
    e.youtube({
        width: old_width+5
    });
    
    c = $.youtube.get(e);
    
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

test("Flexibility", function(){
    expect(57);
    
    var c = $.youtube.config(), id = "t_hR5KNdPEA";
    
    delete c.id;
    delete c.height;
    delete c.width;
    delete c.name;
    
    var e = $(".flexibility-video").children();
    
    e.youtube(c);
    e.each(function(i){
        var y = $.youtube.get(this);
        ok(y instanceof $.youtube, "Check that the "+(i+1)+" have a valid youtube object attached to it");
        if ( ! y ) {
            return false;
        }
        
        ok(y.id === id, "Check id ('"+y.config.id+"' === '"+id+"')");
        ok(y.config.height == "80", "Check height ('"+y.config.height+"' === '80')");
        ok(y.config.width == "200", "Check width ('"+y.config.width+"' === '200')");
        
        if ( $(this).hasClass("hasName") ) {
            ok(y.config.name === "name", "Check name('"+y.config.name+"' === 'name')");
        }
        
        if ( $(this).hasClass("hasId") ) {
            ok($(this).attr("id") === "flexibility-video"+i, "Check #id('"+$(this).attr("id")+"' === 'flexibility-video"+i+"')");
        }
        
        if ($(this).hasClass("hasData") ) {
            ok($(this).data("data") === "data", "Check that data are preserved")
        }
        
    });
    
});

module(_m + $.youtube.IMAGE);
