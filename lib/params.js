// extend existing params
var params = View.prototype.params || new Backbone.Model();

// defaults
params.set({
	touchPrevious: {},
	touchStart: {},
	touches: {}
});
