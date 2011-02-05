(function( $, doc, undefined ) {
"use strict";

var enable_log = window.console && typeof console.log === "function",
params = {
    autohide: false, 
    autoplay: false, 
    disablekb: false, 
    enablejsapi: false, 
    hd: true, 
    showinfo: false, 
    version: "4"
},
rexceptnodes = /span|a|div|td|li|ul|p/gi,
data_attrs = ["width", "height", "id", "name"],
sync_attributes = ["id", "className"],
DATA_ID = "youtube",
log = function(m) {
    if( enable_log && $.youtube.debug ) {
        console.log( typeof m === "string" ? 'jQuery Youtube :: ' + m : m );
    }
    return null;
};

function attr(e, a) {
    var v, i;
    if ( typeof a === "object" ) {
        i = a.length;
        while(i--) {
            if ( ( v = typeof a[i] !== "object" ? e.attr(a[i]) : attr(e, a[i]))) {
                return v;
            }
        }
        return "";
    }
    return e.attr(a) || "";
}

$.fn.youtube = function( type, config ) {
    if ( typeof type === "object" ) {
        config = type;
        type = config.type;
    }
    
    config = config || {};
    
    var i = this.length, 
        yt, 
        typo_s = typeof type === "string",
        validType = typo_s && $.youtube.validType(type), 
        merge;
        
    if ( ! validType && typo_s && (merge = type === $.youtube.IFRAME || type === $.youtube.OBJECT ? {videoType: type,type:$.youtube.VIDEO} : type ? {id: type} : false) ) {
        config = $.extend(true, {}, config, merge);
    }
    
    while ( i-- ) {
        yt = $.youtube.get(this[i]) || new $.youtube(this[i], config);
        
        if ( config.reload === true || yt.is_new || validType && yt.type !== type ) {
            if ( yt.init( ! validType && yt.is_new ? $.youtube.VIDEO : type) ) {
                if ( ! yt.is_new ) {
                    yt.update(config);
                }
                yt.replace(i, this);
            }
            
        } else {
            yt.update(config);
        }
    }
    return this;
};

$.youtube = function(element, config) {
    if ( ! ( this instanceof $.youtube ) ) {
        return new $.youtube(element, config);
    }
    this.element = $(element);
    this.config = $.extend(true, {}, $.youtube.config, config || {});
    this.is_new = true;
};

$.youtube.prototype = {
    
    init: function(type) {
        var fn, i = data_attrs.length,
            jsonStr, item,
            config = this.config,
            containers = this.config.containers,
            element = this.element;
        
        if ( ! (fn = $.youtube.getObjectFn(type)) ) {
            if ( this.is_new || ! (fn = $.youtube.getObjectFn(type = this.type)) ) {
                return log(type + ' is not defined');
            }
        }
        
        config.type = this.type = type;
        
        while ( i-- ) {
            config[data_attrs[i]] = config[data_attrs[i]] || element.data(data_attrs[i]) || attr(element, containers[data_attrs[i]]);
        }

        if ( ! config.id ) {
            config.id = this.id || "";
            return log("no id, returns");
        }

        if ( ! this.validDims() ) {
            jsonStr = attr(element, containers.data);

            if (jsonStr) {
                try {
                    $.extend(config, $.parseJSON(jsonStr));
                } catch(e) {
                    return log("Invalid JSON in "+containers.data+"='"+jsonStr+"'");
                }
            }
            if ( ! this.validDims() ) {
                return log( ' no dimentions, returns' );
            }
        }
        
        config.nodeName = element[0].nodeName;
        
        if ( ! (item = fn.call(this, config)) ) {
            return log("invalid object");
        }
        
        // Sync attributes
        i = sync_attributes.length;
        while ( i-- ) {
            if ( element[0][sync_attributes[i]] ) {
                item[sync_attributes[i]] = element[0][sync_attributes[i]];
            }
        }
        
        // Sync data
        $.data(item, element.data());
        
        // Replace the element
        element.replaceWith( item );
        
        // Replace the element on a lower level
        element[0] = item;
        
        for ( i in $.youtube.bind ) {
            if ( $.isFunction($.youtube.bind[i]) ) {
                element.bind(i, (function(fn, self) {
                        return function() {
                            return fn.call(this, self);
                        };
                    }($.youtube.bind[i], this))
                );
            } else {
                log("unable to bind "+i);
            }
        }
        
        this.is_new = false;
        this.id = config.id;
        
        return this;
    },
    
    update: function(config) {
        for ( var key in config ) {
            this.config[key] = config[key];
            if ( $.isFunction(this.update[key]) && config[key] != this.config[key] ) {
                this.update[key].call(this);
            }
        }
        return this;
    },
    
    replace: function(i, elem) {
        $.data(this.element[0], DATA_ID, this);
        $.data(elem[i], DATA_ID, this);
        elem[i] = this.element[0];
        return this;
    },
    
    validDims: function() {
        return this.config.height && this.config.width;
    },
    
    isObject: function(){
        return this.type === $.youtube.VIDEO && this.config.videoType === $.youtube.OBJECT;
    }
    
};

$.extend($.youtube.prototype.update, {
    id: function() {
        var url = this.type === $.youtube.VIDEO ? 
            $.youtube.video.url(this.config) :
            $.youtube.image.url(this.config);

        this.element[0].src = url;
        if ( this.isObject() ) {
            this.element.find("param[name=movie]").val(url);
        }
    }
});

$.each(["width", "height"], function(i, name) {
    $.youtube.prototype.update[name] = function() {
        this.element[name](this.config[name]);
        if ( this.isObject() ) {
            this.element.find("embed")[name](this.config[name]);
        }
    };
});

$.extend($.youtube, {
    
    // Some constants that could be renamed if you feel for it...
    IMAGE: "image",
    VIDEO: "video",
    IFRAME: "iframe",
    OBJECT : "object",
    
    // Id used to store data on dom elements
    DATA_ID: DATA_ID,

    // Urls
    url: 'http://www.youtube.com/',
    img_url: "http://img.youtube.com/vi/",
    
    debug: enable_log,
    
    config: function( config, val, byRef ) {
        var type = typeof config, name;
        if ( config != null ) {
            if ( type === "object" && config !== null ) {
                for ( name in config ) {
                    $.youtube.config[ name ] = config[ name ];
                }
            } else if ( type === "string" ) {
                if ( val !== undefined ) {
                    $.youtube.config[config] = val;
                } else {
                    return $.youtube.config[config];
                }
            }
        }
        return  $.extend(!byRef, {}, $.youtube.config);
    },
    
    image: function( data ) {
        var e = doc.createElement("img");
        e.src = $.youtube.image.url(data);
        e.width = data.width;
        e.height = data.height;
        return e;
    },

    video: function( data ) {
        var url = $.youtube.video.url(data),
        
        e = data.videoType === $.youtube.IFRAME ?
            $.youtube.video.iframe(data, url) :
            $.youtube.video.object(data, url),
        
        o = doc.createElement(rexceptnodes.test(data.nodeName) ? data.nodeName : (data.nodeName = "span"));
        
        o.appendChild(e);
        
        e.width  = data.width;
        e.height = data.height;
        
        return o;
    },
    
    bind: function(name, fn) {
        $.youtube.bind[name] = fn;
    },
    
    get: function(elem) {
        return typeof elem === "object" && elem !== null ? 
            (elem instanceof $.youtube) ? elem : 
                $.data((elem instanceof $) && elem[0] ? elem[0] : elem, DATA_ID) :
                typeof elem === "string" ? $.youtube.get($(elem)) : undefined;
    },
    
    validType: function( type ) {
        return $.inArray( type, [$.youtube.IMAGE, $.youtube.VIDEO] ) !== -1;
    },
    
    is: function( e ) {
        return (e = $.youtube.get(e)) && (e instanceof $.youtube);
    },
    
    log: log,
    
    getObjectFn: function(type) {
        return type === $.youtube.VIDEO ? $.youtube.video : type === $.youtube.IMAGE ? $.youtube.image: false;
    }

});

$.youtube.image.url = function(data){
    return $.youtube.img_url + data.id+ '/' + data.imageOffset + '.jpg';
};

$.extend($.youtube.video, {
    
    url: function(data) {
        var url = data.id + '?', name, v;
        for ( name in data ) {
            v = data[ name ];
            if ( params[name] != null ) {
                url += name + '=' + (v === false ? "0" : v === true ? "1" : v) + '&';
            }
        }
        url = url.replace(/&$/, "");
        return data.videoType === $.youtube.IFRAME ? 
            $.youtube.url + 'embed/' + url : 
            $.youtube.url + 'v/' + url + '?fs=1&amp;hl=en_US&amp;rel=0';
    },
    
    iframe: function(data, url) {
        var e = doc.createElement("iframe");
        e.title = data.name || data.title || "";
        e.type = "text/html";
        e.src = url;
        e.frameborder = data.iframeBorder;
        return e;
    },
    
    object: function(data, url) {
        var e = doc.createElement("object"), p;

        $.each(["allowFullScreen", "allowscriptaccess", "movie"], function(i, name) {
            p = doc.createElement("param");
            p.name = name;
            p.value = name !== "movie" ? "true" : url;
            e.appendChild(p);
        });

        p = doc.createElement("embed");
        p.src = url;
        p.type = "application/x-shockwave-flash";
        p.allowscriptaccess = "true";

        p.width  = data.width;
        p.height = data.height;

        e.appendChild(p);
        return e;
    }
});

// Default config
// Don't access this directly, use the jQuery.youtube.config() method instead
$.extend($.youtube.config, {
    iframeBorder: "0", 
    imageOffset:  "0", 
    videoType:    $.youtube.OBJECT,
    containers: {
        name: ["title", "name"],
        id:   ['href', "src"],
        data: 'alt',
        width: "width",
        height: "height"
    }
}, params);

}(jQuery, document));
