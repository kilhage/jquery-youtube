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
 * Usage examples:
 *---------------------------------------------------------------
 * Html:
 * @param href: youtube id
 * @param alt: json encoded string with the width and height
 * <a class="youtube" href="47piCmAB0s4" alt="{'width':'300','height':'240'}"></a>
 *
 * Javascript:
 * @param type: The type of element you want to get
 * $.fn.youtube(type);
 *
 * To load the image:
 * $('.youtube').youtube('image');
 *
 * To load the video:
 * $('.youtube').youtube('video', config);
 *---------------------------------------------------------------
 * The global object:
 *
 * $.youtube.config();
 * Will return the current config
 *
 * $.youtube.config({
 *  autohide: true
 * });
 * Will replace the default value of the autohide parameter
 *
 * $.youtube.config({
 *  autohide: true
 * }, true);
 * Will replace the current config with the config object that you pass
 *
 **************************************************************
 
[www.glooby.com](https://www.glooby.com)
[www.glooby.se](https://www.glooby.se)
