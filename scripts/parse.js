var fs = require('fs')
	, path = require('path')
	, sizeOf = require('image-size');


var dir = path.resolve(__dirname, '../assets/annotations');

var out = [];
var csv = '';

fs.readdir(dir, function(err, files) {
	if(err) throw err;

	files.forEach(function(f) {
		var basename = path.basename(f, '.txt');
		var data = fs.readFileSync(path.resolve(dir, f), 'utf8')
			, index = parseInt(basename)
			, lines = data.toString().split("\n")
			, imageName = lines.shift().replace(/\s/g, '') + '.jpg'
			, imagePath = path.resolve(__dirname, '../assets/images/'+imageName)
			, imageSize
			, image = [imageName, null, null]
			, annotations;


		// remove empty line at end
		lines.pop();

		if(fs.existsSync(imagePath)) {
			imageSize = sizeOf(imagePath);
			image[1] = imageSize.width;
			image[2] = imageSize.height;
		}

		console.log(imagePath, imageSize);

		// map annotations
		annotations = lines.map(function(line) {
			var parts = line.split(',');
			return [parseFloat(parts[0]), parseFloat(parts[1])];
		}); 

		out[index] = [image, annotations];
	});

	// remove null at beginning
	out.shift();

	csv = out.map(function(d, i) {
		return i + ',' + d[0].join(',');
	}).join("\n");

	// write file
	fs.writeFile(path.resolve(__dirname, '../assets/annotations.json'), JSON.stringify(out), 'utf8');
	fs.writeFile(path.resolve(__dirname, '../assets/helen.csv'), csv, 'utf8');
	
});