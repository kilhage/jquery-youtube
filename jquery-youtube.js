/****************************************************************
 * jQuery Youtube plugin
 ****************************************************************
 * Class for loading Youtube videos and images
 *
 * https://github.com/kilhage/jquery-youtube
 * @creator Emil Kilhage, 2010
 * @version: 1.0
 * @date: 2011-02-03 00:46:30
 * MIT Licensed.
 * ***************************************************************
 * For usage examples, see readme/examples
 ****************************************************************/
(function($, doc) {
"use strict";

var enable_log = window.console && typeof console.log === "function",
    params = {
        "autohide":true, 
        "autoplay":true, 
        "disablekb":true, 
        "enablejsapi":true, 
        "hd":true, 
        "showinfo":true, 
        "version":true
    },
    config_data = ["width", "height"],
    dim_data = ["width", "height"],
    sync_attributes = ["id", "className"],
    DATA_ID = "__YouTube__";

function log(m) {
    if( enable_log && $.youtube.debug ) {
        console.log( typeof m === "string" ? 'jQuery Youtube :: ' + m : m );
    }
    return null;
}

function attr(e, a) {
    var v, i
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
    
    var i = this.length, yt, id, 
        validType = typeof type === "string" && $.inArray( type, [$.youtube.IMAGE, $.youtube.VIDEO] ) !== -1;
    
    while ( i-- ) {;
        yt = $.youtube.get(this[i]) || new $.youtube(this[i], config);
        if ( config.reload === true || yt.is_new || type && yt.type !== type ) {
            if ( yt.init( ! validType && yt.is_new ? $.youtube.VIDEO : type) ) {
                if ( ! yt.is_new ) {
                    yt.updateConfig(config);
                }
                yt.replace(i, this);
            }
            
        } else {
            yt.updateConfig(config);
        }
    }
    return this;
};

$.youtube = function(element, config) {
    if ( ! ( this instanceof $.youtube ) ) {
        return new $.youtube(element, config);
    }
    this.element = $(element);
    this.config = $.extend(true, {}, $.youtube._config, config || {});
    this.is_new = true;
};

$.youtube.prototype = {
    
    init: function(type){
        var fn,
            i = config_data.length,
            jsonStr, 
            item,
            config = this.config,
            containers = this.config.containers,
            element = this.element;
            
        config.type = this.type = type;
        
        function notValidDims() {
            return ! config.height || ! config.width;
        }
        
        fn = $.youtube[this.type];
        if ( ! $.isFunction(fn) ) {
            return log(this.type + ' is not defined');
        }
        
        while ( i-- ) {
            config[config_data[i]] = config[config_data[i]] || element.data(config_data[i]) || "";
        }

        config.id = this.getId();

        if ( ! config.id ) {
            config.id = this.id;
            return log("no id, returns");
        }

        if ( notValidDims() ) {
            
            // If we are building an image, we can try to get 
            // the dimentions from the width/heigth attributes
            if ( type === $.youtube.IMAGE || element.is("img") ) {
                i = dim_data.length;
                while ( i-- ) {
                    config[dim_data[i]] = config[dim_data[i]] || element.attr(dim_data[i]) || element[dim_data[i]]();
                }
            }
            
            if ( notValidDims() ) {
                jsonStr = attr(element, containers.data);
                if (jsonStr) {
                    try {
                        $.extend(config, $.parseJSON(jsonStr));
                    } catch(e) {
                        log("Invalid JSON in "+containers.data+"='"+jsonStr+"'");
                    }
                }
                if ( !jsonStr || notValidDims() ) {
                    log(this)
                    return log( ' no dimentions, returns' );
                }
            }
        }
        
        config.name = config.name || attr(element, containers.name) || element.data("name") || "";
        
        item = fn.call(this, config);
        
        // Sync attributes
        i = sync_attributes.length;
        while ( i-- ) {
            item[sync_attributes[i]] = element[0][sync_attributes[i]];
        }
        
        // Sync data
        $.data(item, element.data());
        
        // Replace the element
        element.replaceWith( item );
        
        // Replace the element on a lower level
        element[0] = item;
        
        this.is_new = false;
        this.id = config.id;
        
        return this;
    },
    
    updateConfig: function(config) {
        var fns = {}, key, sync = {id:true,width:true,height:true};
        for ( key in config ) {
            if ( sync[key] ) {
                fns[key] = config[key] && config[key] != this.config[key];
            }
            this.config[key] = config[key];
        }
        for ( key in fns ) {
            if ( fns[key] === true ) {
                if ( $.isFunction(this.update[key]) ) {
                    this.update[key].call(this);
                } else {
                    log(key+" isn't a function")
                }
            }
        }
        return this;
    },
    
    getId: function() {
        return this.config.id || this.element.data("id") || attr(this.element, this.config.containers.id);
    },
    
    replace: function(i, elem) {
        $._data(this.element[0], DATA_ID, this);
        $._data(elem[i], DATA_ID, this);
        elem[i] = this.element[0];
        return this;
    },
    
    update: {
        id: function() {
            var url = this.type === $.youtube.VIDEO ? 
                $.youtube.getVideoUrl(this.config) :
                $.youtube.getImageUrl(this.config);

            this.element[0].src = url;
            if ( this.type === $.youtube.VIDEO && this.config.videoType === $.youtube.OBJECT ) {
                this.element.find("param[name=movie]").val(url);
            }
        }
    }
    
};

$.each(["width", "height"], function(i, name){
    $.youtube.prototype.update[name] = function(){
        this.element[name](this.config[name]);
        if ( this.type === $.youtube.VIDEO && this.config.videoType === $.youtube.OBJECT ) {
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
    DATA_ID: DATA_ID,

    url: 'http://www.youtube.com',
    img_url: "http://img.youtube.com/vi/",
    
    debug: enable_log,

    /***
    * @param <object> config: The new config you want to use
    * @param <boolean> <default: true> replace: if you want to replace the config or not
    */
    config: function( config, val, byRef ) {
        var type = typeof config, name;
        if ( config != null ) {
            if ( type === "object" ) {
                for ( name in config ) {
                    $.youtube._config[ name ] = config[ name ];
                }
            } else if ( type === "string" ) {
                if ( val !== undefined ) {
                    this._config[config] = val;
                } else {
                    return $.youtube._config[config];
                }
            }
            return this;
        }
        return byRef ? this._config : $.extend(true, {}, $.youtube._config);
    },
    
    getImageUrl: function(data){
        return $.youtube.img_url + data.id+ '/' + data.imageOffset + '.jpg';
    },
    
    getVideoUrl: function(data) {
        var url = data.id + '?', name, v;
        for ( name in data ) {
            v = data[ name ];
            
            if ( params[name] != null ) {
                if ( v === false ) {
                    v = '0';
                } else if( v === true ) {
                    v = '1';
                }
                url += name + '=' + v + '&';
            }
        }
        return data.videoType === $.youtube.IFRAME ? 
            $.youtube.url + '/embed/' + url : 
            $.youtube.url + '/v/' + url + '?fs=1&amp;hl=en_US&amp;rel=0';
    },
    
    image: function( data ) {
        var e = doc.createElement("img");
        e.src = $.youtube.getImageUrl(data);
        e.width = data.width;
        e.height = data.height;
        return e;
    },

    video: function( data ) {
        var url = $.youtube.getVideoUrl(data), name, e, p;
        
        if ( data.videoType === $.youtube.IFRAME ) {
            e = doc.createElement("iframe");
            e.title = data.name || data.title || "";
            e.type = "text/html";
            e.src = url;
            e.frameborder = data.iframeBorder;
        } else {
            e = doc.createElement("object");
            
            $.each(["allowFullScreen", "allowscriptaccess", "movie"], function(i, name){
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
        }
        
        e.width  = data.width;
        e.height = data.height;
        
        return e;
    },
    
    get: function(elem) {
        return  typeof elem === "object" ? 
            $._data(elem.jquery === $.fn.jquery ? elem[0] : elem, DATA_ID) :
                typeof elem === "string" ? $.youtube.get(elem) : null;
    }

});

// Default config
// Don't access this directly, use the jQuery.youtube.config method instead
$.youtube._config = {
    autohide:     '0',
    autoplay:     '0',
    enablejsapi:  '0',
    version:      '4',
    hd:           '1',
    disablekb:    '0',
    showinfo:     '0',
    iframeBorder: "0", 
    imageOffset:  "0", 
    videoType:    $.youtube.OBJECT,
    containers: {
        name: ["title", "name"],
        id:   ['href', "src"],
        data: 'alt'
    }
};

}(jQuery, document));
