/**
 * @name backbone.input.touch
 * Touch event bindings for Backbone views
 *
 * Version: 1.0.1 (Wed, 13 Oct 2021 05:55:12 GMT)
 * Homepage: https://github.com/backbone-input/touch
 *
 * @author makesites
 * Initiated by Makis Tracend (@tracend)
 *
 * @cc_on Copyright © Makesites.org
 * @license MIT license
 */

(function (lib) {

	//"use strict";

	// Support module loaders
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define('backbone.input.touch', ['jquery', 'underscore', 'backbone'], lib);
	} else if ( typeof module === "object" && module && typeof module.exports === "object" ){
		// Expose as module.exports in loaders that implement CommonJS module pattern.
		module.exports = lib;
	} else {
		// Browser globals
		// - getting the available query lib
		var $ = window.jQuery || window.Zepto || window.vQuery;
		lib($, window._, window.Backbone);
	}

}(function ($, _, Backbone) {

	// support for Backbone APP() view if available...
	var APP = APP || window.APP || null;
	var isAPP = ( APP !== null );
	var View = ( isAPP && typeof APP.View !== "undefined" ) ? APP.View : Backbone.View;

	// The `getValue` and `delegateEventSplitter` is copied from
	// Backbones source, unfortunately these are not available
	// in any form from Backbone itself
	var getValue = function(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;


// default options
var defaults = {
	fastclick: (typeof window.FastClick == "undefined") ? true : false,
	threshold: 10, // in pixels
	inertia: 0, // velocity (in px/sec) before a motion is considered a swipe
	blocking: true,
	auto: true
};

// extend existing params
var params = View.prototype.params || new Backbone.Model();

// defaults
params.set({
	touchPrevious: {},
	touchStart: {},
	touches: {}
});

// extend existing params
var state = View.prototype.state || new Backbone.Model();

// defaults
state.set({
	touching: false,
	clicking: false,
	swiping: false,
	direction: false
});


	var Touch = View.extend({

		name: "touch",

		events: _.extend({}, View.prototype.events, {
			"touchstart": "_touchstart",
			"touchmove": "_touchmove",
			"touchend": "_touchend"
		}),

		params: params.clone(),

		state: state.clone(),

		// Methods

		initialize: function( options ){
			// backwards compatibility (with versions that reset the options...)
			options = options || {};
			options.touch = options.touch || {};
			this.options.touch = _.extend({}, defaults, options.touch );
			this.options.monitor = this.options.monitor || [];
			// optionally:
			// - enable FastClick
			if( this.options.touch.fastclick ) this.fastClick( this.events );
			// - automatically monitor touch events on touch screens
			if( this.options.touch.auto && this.isTouch && !_.inArray("touch", this.options.monitor) ){
				this.options.monitor.push("touch");
			}
			return View.prototype.initialize.apply(this, arguments);
		},

		// Interface

		// Detect if touch handlers should be used over listening for click
		// Allows custom detection implementations
		isTouch : ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 ),
		//old test: 'ontouchstart' in document && !('callPhantom' in window),

		// Protected methods
		_touchstart: function( e ){
			// prerequisite
			var monitor = _.inArray("touch", this.options.monitor);
			if( !monitor ) return;
			//if (e.stopPropagation) e.stopPropagation();
			if( _.inDebug() ) console.log("touchstart", e);
			// save data
			var touches = e.originalEvent.touches;
			this.params.set({ touchStart: _.extend({}, touches) });
			this.params.set({ touches: _.extend({}, touches) });
			this.trigger("touchstart", e);
			if(this.touchstart) this.touchstart( e );
		},

		_touchmove: function( e ){
			// prerequisite
			var monitor = _.inArray("touch", this.options.monitor);
			if( !monitor ) return;
			if( _.inDebug() ) console.log("touchmove", e);
			// compare with e.originalEvent.changedTouches?
			var touches = e.originalEvent.touches;
			// calculate velocity ( support only single finger for now )
			if( touches.length === 1 ){
				var previous = this.params.get("touchPrevious");
				var direction = ( !_.isEmpty(previous) ) ? this._touchDirection( touches[0], previous[0] ) : false;
				// set the states
				this.state.set({
					swiping: (direction) ? true : false,
					direction: direction
				});
				// save previous touch
				this.params.set({ touchPrevious: _.extend({}, touches ) });
				// stop propagating under conditions
				if( direction == "left" || direction == "right" ) {
					//if (e.stopPropagation) e.stopPropagation();
					if (e.preventDefault) e.preventDefault();
				}
			}
			// update data (is this needed?)
			this.params.set({ touches: touches });

			this.trigger("touchmove", e);
			if(this.touchmove) this.touchmove( e );
		},

		_touchend: function( e ){
			// prerequisite
			var monitor = _.inArray("touch", this.options.monitor);
			if( !monitor ) return;
			//if (e.stopPropagation) e.stopPropagation();
			if( _.inDebug() ) console.log("touchend", e);
			// ending one touch doesn't mean there are no other touches...
			var touches = e.originalEvent.touches;
			this.params.set({ touches: _.extend({}, touches) });
			// reset state if no touches left
			if( !touches.length ){
				this.state.set({
					//direction: false, // leave direction for outdated reads...
					touching: false,
					clicking: false,
					swiping: false
				});
				this.params.unset("touchPrevious");
				this.params.unset("touchStart");
				this.params.unset("touches");
			}
			this.trigger("touchend", e);
			if(this.touchend) this.touchend( e );
		},

		// Helpers
		_touch_findEl: function( selector, coords ){
			// variables
			var self = this;
			// default numbers could be the dimensions of the window
			var pos = { top: 0, left: 0 };
			var el = null;
			// check for the existance of the $ namespace
			$(this.el).find( selector ).each(function(){
				var offset = $(this).offset();
				// check against previous
				if( coords.top - offset.top >= 0 && offset.top >= pos.top  ){
					// this is the closest element (so far)
					pos = offset;
					el = this;
					return el;
				}
			});

			return el;
		},

		// Enables better touch support
		//
		// If the users device is touch enabled it replace any `click`
		// event with listening for touch(start|move|end) in order to
		// quickly trigger touch taps
		fastClick: function(events) {
			// prerequisites
			if( !this.isTouch ) return;
			if (!(events || (events = getValue(this, 'events')))) return;
			//this.undelegateEvents();
			var self = this;
			var suffix = '.delegateEvents' + this.cid;
			_(events).each(function(method, key) {
				if (!_.isFunction(method)) method = this[events[key]];
				if (!method) throw new Error('Method "' + events[key] + '" does not exist');
				var match = key.match(delegateEventSplitter);
				var eventName = match[1], selector = match[2];
				var boundHandler = _.bind(self._touchHandler,self);
				method = _.bind(method, self);
				if ( eventName === 'click' ) {
					// remove click event
					this.$el.off('click', selector);
					// add touch event in its place
					this.$el.on('touchstart', selector, boundHandler);
					this.$el.on('touchend', selector, { method:method }, boundHandler );
				}

			}, this);
		},

		// At the first touchstart we register touchevents as ongoing
		// and as soon as a touch move happens we set touching to false,
		// thus implying that a fastclick will not happen when
		// touchend occurs. If no touchmove happened
		// inbetween touchstart and touchend we trigger the event
		//
		// The `blocking` toggle decides if the logic
		// will stop propagation and prevent default
		// for *button* and *a* elements
		_touchHandler : function(e) {
			if (!('changedTouches' in e.originalEvent)) return;
			var touches = e.originalEvent.changedTouches;
			var x = touches[0].clientX;
			var y = touches[0].clientY;
			switch (e.type) {
				case 'touchstart':
					// state
					this.state.set({ clicking: true });
					// data
					this.params.set({ touches: _.extend({}, touches) });
					break;
				case 'touchmove':
					// state (put this behind a threshold condition)
					this.state.set({ clicking: false });
					break;
				case 'touchend':
					var old = this.params.get("touches")[0];
					var threshold = this.options.touch.threshold;
					if (x < (old.clientX + threshold) && x > (old.clientX - threshold) &&
						y < (old.clientY + threshold) && y > (old.clientY - threshold)) {
						this.state.set({ clicking: false });
						if (this.options.touch.blocking) {
							var tagName = e.currentTarget.tagName;
							if (tagName === 'BUTTON' ||
								tagName === 'A') {
								e.preventDefault();
								e.stopPropagation();
							}
						}
						e.data.method(e);
					}
					break;
			}
		},

		_touchDirection: function( a, b ){
			var direction = false;
			var inertia = this.options.touch.inertia;
			var threshold = this.options.touch.threshold;
			var x = a.clientX - b.clientX;
			var y = a.clientY - b.clientY;

			if( x > inertia && y < threshold ){
				direction = "right";
			} else if( x < -inertia && y < threshold  ){
				direction = "left";
			} else if( y > inertia && x < threshold ){
				direction = "bottom";
			} else if( y < -inertia && x < threshold ){
				direction = "top";
			}

			return direction;
		},

		// replacement for: var distance = e.movementX;
		_touchDistance: function( num, axis ){
			// fallbacks
			num = num || 0;
			axis = axis || "x"; // defualt is horizontal
			// variables
			var start = this.params.get('touchStart');
			var touches = this.params.get('touches');
			var coords = {
				x: "clientX",
				y: "clientY"
			};
			// fallbacks?
			return touches[num][coords[axis]] - start[num][coords[axis]];
		}

	});


	// helpers
	_.mixin({
		inArray: function(value, array){
			return array.indexOf(value) > -1;
		},
		// - Check if in debug mode (requires the existence of a global DEBUG var)
		// Usage: _.inDebug()
		inDebug : function() {
			return ( typeof DEBUG != "undefined" && DEBUG );
		},
		// cloning an object (where Object.create fails)
		copy: function( obj ) {
			return JSON.parse( JSON.stringify( obj ) );
		},

		// deep extend, multi-object
		extend: function() {
			var objects = Array.prototype.slice.call(arguments);
			var destination = objects.shift();
			//
			for( var num in objects){
				var source = objects[num];
				for (var property in source) {
					if (source[property] && source[property].constructor && source[property].constructor === Object) {
						destination[property] = destination[property] || {};
						arguments.callee(destination[property], source[property]);
					} else {
						destination[property] = source[property];
					}
				}
			}
			return destination;
		}

	});



	// update Backbone namespace regardless
	Backbone.Input = Backbone.Input ||{};
	Backbone.Input.Touch = Touch;
	// update APP namespace
	if( isAPP ){
		APP.Input = APP.Input || {};
		APP.Input.Touch = Touch;
	}

	// If there is a window object, that at least has a document property
	if( typeof window === "object" && typeof window.document === "object" ){
		window.Backbone = Backbone;
		// update APP namespace
		if( isAPP ){
			window.APP = APP;
		}
	}

	// support module loaders
	return Touch;

}));
