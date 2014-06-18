!function(t){"function"==typeof define&&define.amd?define(["jquery","underscore","backbone"],t):t($,_,Backbone)}(function(t,i,o){var e=e||{},n=function(t,o){return t&&t[o]?i.isFunction(t[o])?t[o]():t[o]:null},s=/^(\S+)\s*(.*)$/,h=o.View,c=h.prototype.params||new o.Model;c.set({touches:{}});var r=h.prototype.state||new o.Model;r.set({touching:!1,clicking:!1,swiping:!1,direction:!1});var a=h.extend({name:"touch",options:i.extend({},h.prototype.options,{touch:{fastclick:"undefined"==typeof e.FastClick?!0:!1,threshold:10,inertia:2,blocking:!0,auto:!0}}),events:i.extend({},h.prototype.events,{touchstart:"_touchstart",touchmove:"_touchmove",touchend:"_touchend"}),params:c,state:r,initialize:function(t){return t=t||{},this.options.touch=i.extend({},this.options.touch,t),this.options.monitor=this.options.monitor||[],this.options.touch.fastclick&&this.fastClick(this.events),this.options.touch.auto&&this.isTouch&&!i.inArray("touch",this.options.monitor)&&this.options.monitor.push("touch"),h.prototype.initialize.apply(this,arguments)},isTouch:"ontouchstart"in document&&!("callPhantom"in e),_touchstart:function(t){var o=i.inArray("touch",this.options.monitor);if(o){i.inDebug()&&console.log("touchstart",t);var e=t.originalEvent.touches;this.params.set({touches:e}),this.trigger("touchstart",t),this.touchstart&&this.touchstart(t)}},_touchmove:function(t){var o=i.inArray("touch",this.options.monitor);if(o){i.inDebug()&&console.log("touchmove",t);var e=t.originalEvent.touches;if(1===e.length){var n=this.params.get("_previousTouch"),s=n?this._touchDirection(e[0],n):!1;this.state.set({swiping:s?!0:!1,direction:s}),this.params.set({_previousTouch:{pageX:e[0].pageX,pageY:e[0].pageY}}),("left"==s||"right"==s)&&t.preventDefault&&t.preventDefault()}this.params.set({touches:e}),this.trigger("touchmove",t),this.touchmove&&this.touchmove(t)}},_touchend:function(t){var o=i.inArray("touch",this.options.monitor);if(o){i.inDebug()&&console.log("touchend",t);var e=t.originalEvent.touches;this.params.set({touches:e}),e.length||(this.state.set({touching:!1,clicking:!1,swiping:!1,direction:!1}),this.params.unset("_previousTouch")),this.trigger("touchend",t),this.touchend&&this.touchend(t)}},_touch_findEl:function(i,o){var e={top:0,left:0},n=null;return t(this.el).find(i).each(function(){var i=t(this).offset();return o.top-i.top>=0&&i.top>=e.top?(e=i,n=this):void 0}),n},fastClick:function(t){if(this.isTouch&&(t||(t=n(this,"events")))){{var o=this;".delegateEvents"+this.cid}i(t).each(function(e,n){if(i.isFunction(e)||(e=this[t[n]]),!e)throw new Error('Method "'+t[n]+'" does not exist');var h=n.match(s),c=h[1],r=h[2],a=i.bind(o._touchHandler,o);e=i.bind(e,o),"click"===c&&(this.$el.off("click",r),this.$el.on("touchstart",r,a),this.$el.on("touchend",r,{method:e},a))},this)}},_touchHandler:function(t){if("changedTouches"in t.originalEvent){var i=t.originalEvent.changedTouches,o=i[0].clientX,e=i[0].clientY;switch(t.type){case"touchstart":this.state.set({clicking:!0}),this.params.set({touches:i});break;case"touchmove":this.state.set({clicking:!1});break;case"touchend":var n=this.params.get("touches")[0],s=this.options.touch.threshold;if(o<n.clientX+s&&o>n.clientX-s&&e<n.clientY+s&&e>n.clientY-s){if(this.state.set({clicking:!1}),this.options.touch.blocking){var h=t.currentTarget.tagName;("BUTTON"===h||"A"===h)&&(t.preventDefault(),t.stopPropagation())}t.data.method(t)}}}},_touchDirection:function(t,i){var o=!1,e=this.options.touch.inertia,n=this.options.touch.threshold,s=t.pageX-i.pageX,h=t.pageY-i.pageY;return s>e&&n>h&&(o="right"),-e>s&&n>h&&(o="left"),h>e&&n>s&&(o="bottom"),-e>h&&n>s&&(o="top"),o}});return i.mixin({inArray:function(t,i){return i.indexOf(t)>-1},inDebug:function(){return"undefined"!=typeof DEBUG&&DEBUG}}),o.View=a,o});