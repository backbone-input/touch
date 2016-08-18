// settings
var FILE_ENCODING = 'utf-8',
	EOL = '\n';

// Dependencies
var _cli = require('commander'),
	_uglify = require("uglify-js"),
	_jshint = require('jshint'),
	_handlebars = require('hbs'),
	_fs = require('fs');


// will generate a CSV if package.json contains multiple licenses
_handlebars.registerHelper('license', function(items){
	items = items.map(function(val){
		return val.type;
	});
	return items.join(', ');
});


// Logic
// - concatinate all files
concat({
	src : [
		'lib/params.js',
		'lib/state.js',
		'lib/view.js',
		'lib/helpers.js'
	],
	dest : 'build/backbone.input.touch.js'
});


// - Validate js
lint('build/backbone.input.touch.js', function(){

	// - Create / save minified file
	uglify('build/backbone.input.touch.js', 'build/backbone.input.touch-min.js');

});


//
// Methods
function concat(opts) {
	var fileList = opts.src;
	var distPath = opts.dest;

	var lib = fileList.map(function(filePath){
			return _fs.readFileSync(filePath, FILE_ENCODING);
		});

	var wrapper = _fs.readFileSync('lib/main.js', FILE_ENCODING);

	var template = _handlebars.compile( wrapper );

	//reuse package.json data and add build date
	var data = JSON.parse( _fs.readFileSync('package.json', FILE_ENCODING) );
	data.lib = lib.join(EOL);
	data.build_date = (new Date()).toUTCString();

	// Save uncompressed file
	_fs.writeFileSync(distPath, template(data), FILE_ENCODING);
	console.log(' '+ distPath +' built.');

}


function uglify(srcPath, distPath) {
	/*
	var
	  jsp = uglyfyJS.parser,
	  pro = uglyfyJS.uglify,
	  ast = jsp.parse( _fs.readFileSync(srcPath, FILE_ENCODING) );

	ast = pro.ast_mangle(ast);
	ast = pro.ast_squeeze(ast);
	*/

	var result = _uglify.minify(srcPath, { compressor: {
		comments : true
	} });

	_fs.writeFileSync(distPath, result.code, FILE_ENCODING);
	console.log(' '+ distPath +' built.');
}

function lint(path, callback) {
	var buf = _fs.readFileSync(path, 'utf-8');
	// remove Byte Order Mark
	buf = buf.replace(/^\uFEFF/, '');

	_jshint.JSHINT(buf);

	var nErrors = _jshint.JSHINT.errors.length;

	if (nErrors) {
		// ruff output of errors (for now)
		console.log(_jshint.JSHINT.errors);
		console.log(' Found %j lint errors on %s, do you want to continue?', nErrors, path);

		_cli.choose(['no', 'yes'], function(i){
			if (i) {
				process.stdin.destroy();
				if(callback) callback();
			} else {
				process.exit(0);
			}
		});
	} else if (callback) {
		callback();
	}
}
