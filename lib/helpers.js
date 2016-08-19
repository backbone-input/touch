
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
