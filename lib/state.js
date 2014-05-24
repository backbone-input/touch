// extend existing params
var state = View.prototype.state || new Backbone.Model();

// defaults
state.set({
	touching: false,
	clicking: false,
	swiping: false,
	direction: false
});

