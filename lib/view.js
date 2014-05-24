	var Touch = View.extend({

		name: "touch",

		options: _.extend({}, View.prototype.options, {
			touch: {
				fastclick: (typeof window.FastClick == "undefined") ? true : false
			}
		}),

		events: _.extend({}, View.prototype.events, {
			"touchstart": "_touchstart",
			"touchmove": "_touchmove",
			"touchend": "_touchend"
		}),

		params: params,

		state: state,

		// Methods

		initialize: function(){
			// backwards compatibility (with versions that reset the options...)
			this.options.touch = this.options.touch || {};
			if( this.options.touch.fastclick ) this.fastClick( this.events );
			return View.prototype.initialize.apply(this, arguments);
		},

		// Interface

		// Detect if touch handlers should be used over listening for click
		// Allows custom detection implementations
		isTouch : 'ontouchstart' in document && !('callPhantom' in window),

		// Protected methods
		_touchstart: function( e ){
			// prerequisite
			var monitor = _.inArray("touch", this.options.monitor);
			if( !monitor ) return;
			//if (e.stopPropagation) e.stopPropagation();
			if( _.inDebug() ) console.log("touchstart", e);
			// save touches
			var touches = e.originalEvent.touches;
			this.params.set({ touches: touches });
			this.trigger("touchstart", e);
			if(this.touchstart) this.touchstart( e );
		},

		_touchmove: function( e ){
			// prerequisite
			var monitor = _.inArray("touch", this.options.monitor);
			if( !monitor ) return;
			//if (e.stopPropagation) e.stopPropagation();
			if (e.preventDefault) e.preventDefault();
			if( _.inDebug() ) console.log("touchmove", e);
			// compare with e.originalEvent.changedTouches
			var touches = e.originalEvent.touches;
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
			this.params.set({ touches: false });
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

		touchPrevents : true,

		touchThreshold : 10,

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
		// The `touchPrevents` toggle decides if Backbone.touch
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
					this.params.set({ touches: touches });
					break;
				case 'touchmove':
					// state
					this.state.set({ clicking: false });
					break;
				case 'touchend':
					var old = this.params.get("touches")[0];
					var threshold = this.touchThreshold;
					if (x < (old.clientX + threshold) && x > (old.clientX - threshold) &&
						y < (old.clientY + threshold) && y > (old.clientY - threshold)) {
						this.state.set({ clicking: false });
						if (this.touchPrevents) {
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
		}
	});
