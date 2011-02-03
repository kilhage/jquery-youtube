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

var IMAGE         = 'image',
VIDEO             = 'video',
IFRAME            = 'iframe',
OBJECT            = 'object',
STRING            = 'string',
BOOL              = 'boolean',
NUMBER            = 'number',
FUNCTION          = 'function',
availableOptions  = [IMAGE, VIDEO],
enable_log = this.console && typeof console.log === FUNCTION,
params = {"autohide":true, "autoplay":true, "disablekb":true, "enablejsapi":true, "hd":true, "showinfo":true, "version":true},
sync = ["config", "containers", "selector"],
config_data = ["width", "height", "name"],
dim_data = ["width", "height"],
push = Array.prototype.push,
DATA_ID = "__youtube";

function log(m) {
    if( enable_log && $.youtube.log() ) {
        console.log( typeof m === STRING ? 'jQuery Youtube :: ' + m : m );
    }
    return null;
}

$.fn.youtube = function( type, config ) {
    if ( typeof type === OBJECT ) {
        config = type;
        type = config.type;
    }
    
    config = config || {};
    
    var i = this.length, yt, id, 
        validType = typeof type === STRING && $.inArray( type, availableOptions ) !== -1;
    
    while ( i-- ) {
        yt = $.data(this[i], DATA_ID) || new $.youtube(this[i], config);
        if ( config.reload === true || yt.is_new || type && yt.type !== type ) {
            if ( yt.init( ! validType && yt.is_new ? VIDEO : type) ) {
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
    this.containers = {
        name: 'title',
        id:   'id',
        data: 'alt'
    };
    this.is_new = true;
};

$.youtube.prototype = {
    _y: 'http://www.youtube.com',
    
    init: function(type){
        var fn,
            i = config_data.length,
            self = this,
            jsonStr, 
            item, 
            id;
            
        this.config.type = this.type = type;
        
        function notValidDims() {
            return ! self.config.height || !self.config.width;
        }
        
        fn = $.youtube[this.type];
        if ( typeof fn !== FUNCTION ) {
            return log(this.type + ' is not defined');
        }
        
        while ( i-- ) {
            this.config[config_data[i]] = this.config[config_data[i]] || this.element.data(config_data[i]) || "";
        }

        this.config.id = this.getId();

        if ( ! this.config.id ) {
            this.config.id = this.id;
            return log("no id, returns");
        }

        if ( notValidDims() ) {
            
            // If we are building an image, we can try to get 
            // the dimentions from the width/heigth attributes
            if ( type === IMAGE ) {
                i = dim_data.length;
                while ( i-- ) {
                    this.config[dim_data[i]] = this.element.attr(dim_data[i]);
                    if ( ! this.config[dim_data[i]] ) {
                        this.config[dim_data[i]] = this.element[dim_data[i]]();
                    }
                }
            }
            
            if ( notValidDims() ) {
                jsonStr = this.element.attr(this.containers.data);
                if (jsonStr) {
                    try {
                        $.extend(this.config, $.parseJSON(jsonStr));
                    } catch(e) {
                        log("Invalid JSON in "+this.containers.data+"='"+jsonStr+"'");
                    }
                }
                if ( !jsonStr || notValidDims() ) {
                    return log( ' no dimentions, returns' );
                }
            }
        }
        
        i = sync.length;
        while ( i-- ) {
            this.config[sync[i]] = this[sync[i]];
        }
        
        item = fn.call(this, this.config);
        
        // Replace the element with the video/image
        this.element.replaceWith( item );
        this.element[0] = item[0];
        this.is_new = false;
        this.id = this.config.id;
        
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
                if ( typeof this.update[key] === FUNCTION) {
                    this.update[key].call(this);
                } else {
                    log(key+" isn't a function")
                }
            }
        }
        return this;
    },
    
    getId: function() {
        return this.config.id || this.element.data("id") || this.element.attr("href");
    },
    
    replace: function(i, elem) {
        $.data(this.element[0], DATA_ID, this);
        $.data(elem[i], DATA_ID, this);
        elem[i] = this.element[0];
        return this;
    },
    
    update: {
        id: function() {
            var url = this.type === VIDEO ? 
                $.youtube.getVideoUrl(this.config) :
                $.youtube.getImageUrl(this.config);

            this.element[0].src = url;
            if ( this.type === VIDEO && this.config.videoType === OBJECT ) {
                this.element.children().each(function(){
                    if ( this.name === "movie" ) {
                        this.value = url;
                    }
                });
            }
        }
    }
    
};

$.each(["width", "height"], function(i, name){
    $.youtube.prototype.update[name] = function(){
        this.element[name](this.config[name]);
        if ( this.type === VIDEO && this.config.videoType === OBJECT ) {
            this.element.find("embed")[name](this.config[name]);
        }
    }
});

$.extend($.youtube, {
    IMAGE: IMAGE,
    VIDEO: VIDEO,
    IFRAME: IFRAME,
    OBJECT : OBJECT,
    DATA_ID: DATA_ID,

    _y: 'http://www.youtube.com',
    
    // Don't access this directly, use the jQuery.youtube.config method instead
    _config: {
        autohide:     '0',
        autoplay:     '0',
        enablejsapi:  '0',
        version:      '4',
        hd:           '1',
        disablekb:    '0',
        showinfo:     '0',
        iframeBorder: "0", 
        imageOffset:  "0", 
        videoType:    OBJECT
    },
    
    _log: enable_log,

    /* * *
    * @param <string> id           : identifier
    * @param <string> val          : youtube-id
    * @param <string or int> width : width of the video/image
    * @param <string or int>       : height of the video/image
    */
    getElementHtml: function( id, val, width, height, name ) {
        if ( !id ) {
            return log(' :: getElementHtml: identifier or value is not set');
        }
        var idtype  = 'id',
        _id     = id.replace( '.' , '' ),
        dim     = '';

        if ( _id.length < id.length ) {
            id      = _id;
            idtype  = 'class';
        } else if( (_id = id.replace( '#' , '' ).length) < id.length ) {
            id = _id;
        }

        if ( width && height ) {
            dim = ' data-width="' + width + '" data-height="' + height + '"';
        }
        if ( name ) {
            dim += " data-name='"+name+"'";
        }
        if ( val ) {
            dim += ' data-id="' + val + '"';
        }

        return '<a ' + idtype + '="' + id + '"' + dim + '></a>';
    },

    /* * *
    * Alias for the getElementHtml
    *
    * This method also adds the possibilty to get more then one element at the time
    *
    */
    element: function( id, val, width, height ) {
        switch( typeof id ) {
            case STRING:
                return this.getElementHtml( id, val, width, height );

            case OBJECT:
                var e = [], k;
                for( k in id ) {
                    if( id[ k ] ) {
                        e.push(this.getElementHtml( k, id[ k ], width, height ));
                    }
                }
                return e;

            default:
                return log(' :: element: invalid data type for id');
        }
    },

    /***
    * @param <object> config: The new config you want to use
    * @param <boolean> <default: true> replace: if you want to replace the config or not
    */
    config: function( config, val ) {
        var type = typeof config, name;
        if ( config != null ) {
            if ( type === OBJECT ) {
                for( name in config ) {
                    this._config[ name ] = config[ name ];
                }
            } else if ( type === STRING ) {
                if ( val !== undefined ) {
                    this._config[config] = val;
                } else {
                    return this._config[config];
                }
            }
            return this;
        }
        return $.extend(true, {}, this._config);
    },

    /***
    * Internal log function, used for debuging
    *
    * @param {mixed} v:
    *   boolean: set if the internal log function
    *   should be enabled or not, you can also enter enable or disable to set this value
    *   string: log a message using the internal log function
    *   int: same as string
    *
    * @return: if the internal log function if enable or not(only if the don't pass something, else null)
    */
    log: function( v ) {
        // If no value passed, return if the log is enabled or not
        if( ! ( 0 in arguments ) ) {
            return this._log;
        }
        switch( typeof v ) {
            //if true/false passed, turn on/off the internal log function
            case BOOL:
                this._log = v;
                break;
            case NUMBER:
            case STRING:
                switch( v ) {
                    //if 'enable' passed, enable the internal log function
                    case 'enable':
                        this._log = true;
                        break;

                    //if 'disable' passed, disable the internal log function
                    case 'disable':
                        this._log = false;
                        break;

                    //else log the value using the internal log function
                    default:
                        log( v );
                }
                break;
        }
        return null;
    },
    
    getImageUrl: function(data){
        return "http://img.youtube.com/vi/"+ data.id+ '/' + data.imageOffset + '.jpg';
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
        return data.videoType === IFRAME ? 
            this._y + '/embed/' + url : 
            this._y + '/v/' + url + '?fs=1&amp;hl=en_US&amp;rel=0';
    },
    
    image: function( data ) {
        var e = doc.createElement("img");
        e.src = $.youtube.getImageUrl(data);
        e.width = data.width;
        e.height = data.height;
        return $(e);
    },

    video: function( data ) {
        var url = $.youtube.getVideoUrl(data), name, e, p, self = this;
        
        if ( data.videoType === IFRAME ) {
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
        
        return $(e);
    },
    
    get: function(elem) {
        return  typeof elem === OBJECT ? 
            $.data(elem.jquery === $().jquery ? elem[0] : elem, DATA_ID) :
                typeof elem === STRING ? this.get(elem) : null;
    }

});

}(jQuery, document));
