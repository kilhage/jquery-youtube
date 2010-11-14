/****************************************************************
 * jQuery Youtube plugin
 ****************************************************************
 * Class for loading Youtube videos and images
 *
 * https://github.com/kilhage/jquery-youtube
 * @creator Emil Kilhage, 2010
 * @version: 1.0
 * @date: 2010-11-14 04:33:30
 * MIT Licensed.
 * ***************************************************************
 * For usage examples, see readme/examples
 ****************************************************************/
(function( $ ) {
"use strict";

var IMAGE         = 'image',
VIDEO             = 'video',
IFRAME            = 'iframe',
OBJECT            = 'object',
STRING            = 'string',
BOOL              = 'boolean',
NUMBER            = 'number',
FUNCTION          = 'function',
defaultEnableLog  = false,
availableOptions  = [IMAGE, VIDEO],
defaultConfig     = {
  autohide:       '0',
  autoplay:       '0',
  enablejsapi:    '0',
  version:        '4',
  hd:             '1',
  disablekb:      '0',
  showinfo:       '0'
};

function log(m) {
  if( $.youtube.log() ) {
    console.log( 'jQuery Youtube :: ' + m );
  }
  return null;
}

function Youtube() {
  this.__init.apply(this, arguments);
}

Youtube.prototype = {

  videoType:    OBJECT,
  iframeBorder: '0',
  imageOffset:  '0',
  _y:           'http://www.youtube.com',
  containers: {
    name: 'title',
    id:   'href',
    data: 'alt'
  },

  __init: function( elements, type, config )
  {
    //get config from the global youtube object
    this.config = $.youtube.config();

    this.selector = elements.selector;

    //insert config
    for( var name in config )
    {
      this.config[ name ] = config[ name ];
    }

    this.elements = $( elements );

    this.type = type;

    var _this = this;

    //loop through all matched elements and initzializes them
    this.elements.each(function()
    {
      _this.init( this );
    });
  },

  init: function( o )
  {
    this.element = $( o );

    var data = {};

    this.dims = this.element.attr( this.containers.data );

    if(!this.dims)
    {
      data.width  = this.element.width();
      data.height = this.element.height();

      if( !data.height || !data.width )
      {
        data.width  = this.config.width;
        data.height = this.config.height;

        if( ! data.height || !data.width )
        {
          return log( ' no dimentions, returns' );
        }
      }

    }
    else
    {
      data = JSON.parse( this.dims );
    }

    var vars = {
      width:  data.width,
      height: data.height,
      id: this.element.attr( this.containers.id )
    };

    //set required values, if any one of them isn't set, return.
    for( var k in vars )
    {
      if( vars[ k ] )
      {
        this[ k ] = vars[ k ];
      }
      else
      {
        return log( k + ' empty, returns' );
      }
    }

    this.name = this.element.attr( this.containers.name );

    //dimention html
    var dim = 'width="' + this.width + '" height="' + this.height + '"',

    m = 'setHtmlOfType_'  + this.type;

    this.selector = this.selector.replace( '#' , '' ).replace( '.' , '' );

    //check if the requested function exist
    if(this[ m ])
    {
      //get html from a method based on what type you type in
      this.html = this[ m ]( dim );
    }
    else
    {
      return log(m + ' is not defined');
    }

    //replace the element with the video/image
    this.element.replaceWith( this.html );

    return null;
  },

  setHtmlOfType_image: function( dim )
  {
    return '<img class="' + this.selector + '" ' + this.containers.id + '="' + $.trim( this.id ) + '" src="http://img.youtube.com/vi/' + $.trim( this.id ) + '/' + this.imageOffset + '.jpg" ' + dim + ' />';
  },

  setHtmlOfType_video: function( dim )
  {
    var url = $.trim(this.id) + '?';

    for( var name in this.config )
    {
      if( this.config[ name ] )
      {
        var v = this.config[ name ];

        if( v && $.inArray( typeof v, [STRING, NUMBER, BOOL] ) !== -1 )
        {
          if( v === false )
          {
            v = '0';
          }
          else if( v === true )
          {
            v = '1';
          }
          url += name + '=' + v + '&';
        }
      }
    }

    switch( this.videoType )
    {
      case IFRAME:
        return '<iframe title="' + this.name + '" ' + this.containers.id + '="' + this.selector + '" type="text/html" src="' + this._y + '/embed/' + url + '" ' + dim + ' frameborder="'+this.iframeBorder+'"></iframe>';

      default:
        return '<object ' + dim + ' class="' + this.selector + '"><param name="movie" value="' + this._y + '/v/' + url + '?fs=1&amp;hl=en_US&amp;rel=0"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="' + this._y + '/v/' + url + '?fs=1&amp;hl=en_US&amp;rel=0" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" ' + dim + '></embed></object>';

    }
  }

};

function YouTubeBase(){}

YouTubeBase.prototype = {

  _config: defaultConfig,
  _log: defaultEnableLog,

  /* * *
   * @param <string> id           : identifier
   * @param <string> val          : youtube-id
   * @param <string or int> width : width of the video/image
   * @param <string or int>       : height of the video/image
   */
  getElementHtml: function( id, val, width, height )
  {
    if( !id || !val )
    {
      return log(' :: getElementHtml: identifier or value is not set');
    }
    var idtype  = 'id',
        _id     = id.replace( '.' , '' ),
        dim     = '';

    if( _id.length < id.length )
    {
      id      = _id;
      idtype  = 'class';
    }
    else if( id.replace( '#' , '' ).length < id.length )
    {
      id = id.replace( '#' , '' );
    }

    if( width && height )
    {
      dim = 'alt=\'{"width":"' + width + '","height":"' + height + '"}\'';
    }

    return '<a ' + idtype + '="' + id + '" href="' + val + '"' + dim + '></a>';
  },

  /* * *
   * Alias for the getElementHtml
   *
   * This method also adds the possibilty to get more then one element at the time
   *
   */
  element: function( id, val, width, height )
  {
    switch( typeof id )
    {
      case STRING:
        return this.getElementHtml( id, val, width, height );

      case OBJECT:
        var e = [ ];
        for( var k in id )
        {
          if( id[ k ] )
          {
            e.push(this.getElementHtml( k, id[ k ], width, height ));
          }
        }
        return e;

      default:
        return log(' :: element: invalid data type for id');
    }
  },

  /* * *
   * @param <object> config: The new config you want to use
   * @param <boolean> <default: true> replace: if you want to replace the config or not
   */
  config: function( config, replace )
  {
    if( !config )
    {
      return this._config;
    }

    replace = replace || true;

    if( replace )
    {
      this._config = config;
    }
    else
    {
      for( var name in config )
      {
        this._config[ name ] = config[ name ];
      }
    }
    return this._config;
  },

  /* * *
   * Internal log function, used for debuging
   *
   * @param {mixed} v:
   *   boolean: set if the internal log function should be enabled or not, you can also enter enable or disable to set this value
   *   string: log a message using the internal log function
   *   int: same as string
   *
   * @return: if the internal log function if enable or not(only if the don't pass something, else null)
   */
  log: function( v )
  {
    //if no value passed, return if the log is enabled or not
    if( ! v )
    {
      return this._log;
    }
    switch( typeof v )
    {
      //if true/false passed, turn on/off the internal log function
      case BOOL:
        this._log = v;
        break;
      case NUMBER:
      case STRING:
        switch( v )
        {
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
  }

};

$.fn.youtube = function( type, config ) {
  //if no elements, return
  if( this.length < 1 )
  {
    return this;
  }

  if( typeof config !== OBJECT )
  {
    config = { };
  }

  //if type is of any other datatype than a string, set type the video
  if( typeof type !== STRING || $.inArray( type, availableOptions ) === -1 )
  {
    type = VIDEO;
  }
  else
  {
    type = type.toLowerCase();
  }

  var y = new Youtube( this, type, config );

  return $(this.selector);
};

$.youtube = new YouTubeBase();

}( jQuery ));
