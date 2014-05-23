# Backbone Input: Touch


Enables Backbone views with fast tap and swipe events on touch devices.

The plugin is made to work with your existing views. It replaces the `delegateEvents` method and replaces any *click* event with the three events *touchstart*, *touchmove* and *touchend* when a touch device is used. Once the touchend fires your callback is executed without the 300ms delay that the *click* event has.


## Examples

*


## Features

* Addresses the 300ms delay
* Uses FastClick if available
* One finger swipes


## Dependencies

* [Backbone](http://backbonejs.org/)
* [Underscore](http://underscorejs.org/)
* [jQuery](http://jquery.com/)


## Install

Using [Bower](http://bower.io/)
```
bower install backbone.touch`
```
Manual download

* [Uncompressed](https://github.com/backbone-input/touch/raw/master/build/backbone.input.touch-min.js)
* [Minified](https://github.com/backbone-input/touch/raw/master/build/backbone.input.touch-min.js)


## Usage

Note that this extension currently overwrites `Backbone.View` but its features are behing an option flag, to limit its usage only when needed.

After all dependencies (an plugin) are loaded,  simply state:

```
var view = Backbone.View({
	options: {
		touch: true
	}
});
```


## Credits

Initiated by Makis Tracend ( [@tracend](http://github.com/tracend) )

Distributed through [Makesites.org](http://makesites.org)

Originally based on [Backbone.Touch](https://github.com/nervetattoo/backbone.touch)


## License

Released under the [MIT License](http://makesites.org/licenses/MIT)
