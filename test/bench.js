
plugin("jQuery.youtube");

module("Video", 1000);

test("Data from .data, reload", function(t){
    while(t--) {
        $('<a data-id="47piCmAB0s4" data-width="300" data-height="240" />').youtube();
    }
    
});

test("Dimentions and id from .data", function(t){
    var a;
    while(t--) {
        a = $(document.createElement("a"))
            .data("id", "47piCmAB0s4")
            .data("width", "300")
            .data("height", "240")
            .youtube();
    }
    
});

test('Dimentions from alt=\'{"width":500,"height":400}\', id from $.data, reload', function(t){
    var a;
    while(t--) {
        a = document.createElement("a");
        $.data(a, "id", "47piCmAB0s4");
        a.alt = '{"width":500,"height":400}';
        $(a).youtube();
    }
    
});

test('Dimentions from alt=\'{"width":500,"height":400}\', id from .data, reload', function(t){
    var a;
    while(t--) {
        a = document.createElement("a");
        a.alt = '{"width":500,"height":400}';
        $(a).data("id", "47piCmAB0s4").youtube();
    }
    
});

test("Data from json", function(t){
    while(t--) {
        $(document.createElement("a")).youtube({
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });
    }
    
});

test("Fast", function(t){
    var a = document.createElement("a"), b = $(a);
    while(t--) {
        b.youtube({
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });
    }
});

test("Fast2", function(t){
    var a = document.createElement("a");
    while(t--) {
        $(a).youtube({
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });
    }
    
});

module("Image", 1000);

test("Data from json, reload", function(t){
    var a;
    while(t--) {
        $(document.createElement("img")).youtube({
            type: $.youtube.IMAGE,
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });
    }
    
});

test("Dimentions from width/height attributes, id from $.data, reload", function(t){
    var img;
    while(t--) {
        img = document.createElement("img");
        img.width = 500;
        img.height = 400;
        $.data(img, "id", "47piCmAB0s4");
        $(img).youtube($.youtube.IMAGE);
    }
    
});

test("Dimentions from width/height attributes, id from .data, reload", function(t){
    var img;
    while(t--) {
        img = document.createElement("img");
        img.width = 500;
        img.height = 400;
        $(img).data("id", "47piCmAB0s4").youtube($.youtube.IMAGE);
    }
    
});

test("Fast", function(t){
    var img = document.createElement("img");
    while(t--) {
        $(img).youtube({
            type: $.youtube.IMAGE,
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });
    }
});

test("Fast2", function(t){
    var img = document.createElement("img"), b = $(img);
    while(t--) {
        b.youtube({
            type: $.youtube.IMAGE,
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });
    }
});

module("Internal");

test("$.youtube.get($(e))", 10000, function(t){
    var e = document.createElement("a");
    var b = $(e).youtube({
            type: $.youtube.IMAGE,
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });
    
    while(t--) {
        $.youtube.get(b);
    }
});

test("$.youtube.get(e)", 10000, function(t){
    var e = document.createElement("a");
    var b = $(e).youtube({
            type: $.youtube.IMAGE,
            id: "47piCmAB0s4",
            width: 500,
            height: 400
        });

    while(t--) {
        $.youtube.get(e);
    }
});

test("$.youtube.config()", 10000, function(t){
    while(t--) {
        $.youtube.config();
    }
});

test("$.youtube.config('hd')", 10000, function(t){
    while(t--) {
        $.youtube.config("hd");
    }
});
