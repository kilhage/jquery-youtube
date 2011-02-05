
var log = $.youtube.log,
    ID = "47piCmAB0s4";

function setupConfig(){
    return $.extend($.youtube.config(), {
        width: "200",
        height: "150",
        id: ID,
        name: "name"
    });
}

function validUrl(url, config) {
    for( var parts = url.split("?")[1].split("&"), c, i = 0; i <= parts.length; (c = parts[i++]) ) {
        if ( c != null ) {
            c = c.split("=");
            if( c[1] !== (config[c[0]] === true ? "1" : config[c[0]] === false ? "0" : config[c[0]]) ) {
                return false;
            }
        }
    }
    return true;
}

module(_m + "Internal");

test("$.youtube.config()", function() {
    expect(4);
    
    var config = $.youtube.config(), org_hd = config.hd, n = "11111";

    ok(typeof config === "object", "valid config");
    
    config.hd = n;
    ok($.youtube.config.hd != n, "Make sure $.youtube.config() is passing a copy of the config");
    
    ok($.youtube.config("hd") === $.youtube.config.hd, "");
    
    $.youtube.config("hd", n);
    ok($.youtube.config("hd") === n && $.youtube.config.hd === n, "");
    
    $.youtube.config.hd = org_hd;
    
});

test("$.youtube.get()", function(){
    expect(3);
    var c = setupConfig();
    
    c.type = $.youtube.VIDEO;
    c.videoType = $.youtube.IFRAME;
    ok($.youtube.get($("<div />").youtube(c)));
    
    c.type = $.youtube.VIDEO;
    c.videoType = $.youtube.OBJECT;
    ok($.youtube.get($("<div />").youtube(c)));
    
    c.type = $.youtube.IMAGE;
    ok($.youtube.get($("<div />").youtube(c)));
    
});

test("$.youtube.is()", function(){
    expect(15);
    
    var c = setupConfig(),
    NOT = [
        $("<div />"),
        $(),
        [],
        {},
        "hjk",
        432432,
        null,
        undefined,
        function(){},
        new (function(){}),
        true,
        false,
        NaN
    ],
    OK = [
        $("<div />").youtube(c),
        $("<div />").youtube(c)[0]
    ],
    
    i = OK.length;
    while(i--) {
        ok($.youtube.is(OK[i]), "check '"+OK[i]+"' is a valid youtube object");
    }
    
    i = NOT.length;
    while(i--) {
        ok(!$.youtube.is(NOT[i]), "check '"+NOT[i]+"' isn't a valid youtube object");
    }
    
});

test("Constants", function() {
    expect(4);

    $.each({"OBJECT": "_object", "IFRAME": "_iframe", "VIDEO": "_video", "IMAGE": "_image"}, function(key, value){
        var std = $.youtube[key],
            new_v = value, a, y;

        $.youtube[key] = new_v;

        try {
            a = $("<div data-id='t_hR5KNdPEA' data-width='200' data-height='150' />").youtube($.youtube[key]);
            y = $.youtube.get(a);
        } catch(e) {
            log(e);
            ok(false, "ok errors");
        }
        
        if ( key === "VIDEO" || key === "IMAGE" ) {
            ok(y && y.type === $.youtube[key], "Valid youtube object and type");
        } else {
            ok(y && y.type === $.youtube.VIDEO && y.config.videoType === $.youtube[key], "Valid youtube object and type");
        }
        
        $.youtube[key] = std;

    });

});

module( _m + $.youtube.VIDEO);

test("Build a valid iframe element", function() {
    expect(6);
  
    var data = setupConfig();
    
    data.videoType = $.youtube.IFRAME;
    
    var e = $($.youtube.video(data)).find("iframe");
  
    $.each({
        localName: "iframe",
        width: "200", 
        height: "150",
        title: "name", 
        type: "text/html"
    }, function(k,v){
        equals(e[0][k], v, "Check: "+k);
    });
    
    ok(validUrl(e[0].src, data), "Check: src");
    
});

test("Build a valid object element", function() {
    expect(13);
    var data = setupConfig();
    
    data.videoType = $.youtube.OBJECT;
    
    var e = $($.youtube.video(data)).find("object");
    
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
                ok(validUrl(this.value, data));
                break;
            default:
                if ( this.localName != "embed" ) {
                    ok(false, "invalid element in the <object> localName="+this.localName);
                    break;
                }
                
                ok(validUrl(this.src, data), "src on the embed element");
                equals(this.type, "application/x-shockwave-flash", "type on the embed element");
                equals(this.width, "200", "width on the embed element");
                equals(this.height, "150", "height on the embed element");
                break;
        }
    });
    
});

test("Youtube object maintenance", function() {
    expect(19);
    
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
    
    e.youtube("t_hR5KNdPEA");
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
    
    var new_id = "7rE0-ek6MZA";
    
    e.youtube(new_id);
    
    c = $.youtube.get(e);
    
    ok(c.__check);
    ok(c.config.id === new_id);
    
});

test("Flexibility", function(){
    expect(62);
    
    var c = $.youtube.config(), id = "t_hR5KNdPEA";
    
    var e = $(".flexibility-video").hide().children();
    
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
    
    c.height = "20";
    c.width = "582";
    
    $.each([
            ID,
            $.youtube.VIDEO,
            $.youtube.IMAGE, 
            $.youtube.OBJECT, 
            $.youtube.IFRAME
        ], function(i, param) {
        switch(i) {
            case 0:
                delete c.id;
                break;
            case 4:
            case 3:
                c.videoType = "";
            case 1:
            case 2:
                c.id = ID;
                break;
        }
        
        var a = $("<div />").youtube(param, c);
        var y = $.youtube.get(a);
        
        if ( ! $.youtube.is(a) ) {
            log(a);
            ok(false, "not a valid object");
            return;
        }
        
        switch(i) {
            case 0:
                equal(y.config.id, param, "check id");
                break
            case 1:
                equal(y.config.type, param, "check is video");
                break
            case 2:
                equal(y.config.type, param, "check is image");
                break
            case 3:
                equal(y.config.videoType, param, "check is object");
                break
            case 4:
                equal(y.config.videoType, param, "check is iframe");
                break
        }
    });
    
});

module(_m + $.youtube.IMAGE);

// TODO
