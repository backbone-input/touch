
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
		}
	});
