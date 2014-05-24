/**
 * @name {{name}}
 * {{description}}
 *
 * Version: {{version}} ({{build_date}})
 * Homepage: {{homepage}}
 *
 * @author {{author}}
 * Initiated by: Makis Tracend (@tracend)
 *
 * @cc_on Copyright © Makesites.org
 * @license {{#license licenses}}{{/license}}
 */


(function (lib) {

	//"use strict";

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery', 'underscore', 'backbone'], lib);
	} else {
		// Browser globals
		lib($, _, Backbone);
	}
}(function ($, _, Backbone) {

	//"use strict";
	// better way to define global scope?
	var window = window || {};

	// The `getValue` and `delegateEventSplitter` is copied from
	// Backbones source, unfortunately these are not available
	// in any form from Backbone itself
	var getValue = function(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	//var View = ( isAPP ) ? APP.View : Backbone.View;
	var View = Backbone.View;


{{{lib}}}


	Backbone.View = Touch;

	return Backbone;
}));
