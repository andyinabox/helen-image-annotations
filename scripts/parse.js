var fs = require('fs')
	, path = require('path');


var dir = path.resolve(__dirname, '../assets/annotations');

var out = [];

fs.readdir(dir, function(err, files) {
	if(err) throw err;

	files.forEach(function(f) {
		var basename = path.basename(f, '.txt');
		var data = fs.readFileSync(path.resolve(dir, f), 'utf8')
			, index = parseInt(basename)
			, lines = data.toString().split("\n")
			, image = lines.shift().replace(/\s/g, '')
			, annotations;

		// remove emtpty line at end
		lines.pop();

		annotations = lines.map(function(line) {
			var parts = line.split(',');
			return [parseFloat(parts[0]), parseFloat(parts[1])];
		}); 

		out[index] = [image, annotations];
	});

	// remove null at beginning
	out.shift();

	// write file
	fs.writeFile(path.resolve(__dirname, '../assets/annotations.json'), JSON.stringify(out), 'utf8');
	
});