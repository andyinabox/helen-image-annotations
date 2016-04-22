var AWS = require('aws-sdk')	
	, fs = require('fs')
	, path = require('path')
	// , sizeOf = require('image-size')
	, lwip = require('lwip')

	, s3 = new AWS.S3();

var HELEN_BUCKET = 'helen-images';
var AWS_IMAGES_PATH = 'images/';
var ANNOTATIONS_DIR = path.resolve(__dirname, '../assets/annotations');

var out = [];
var csv = '';

fs.readdir(ANNOTATIONS_DIR, function(err, files) {
	if(err) throw err;

	var remaining = files.length-1;

	next(0);

	function next(currentIndex) {
		console.log('NEXT: '+currentIndex);

		if(currentIndex >= files.length) {
			console.log('Attempted to access invalid index ('+currentIndex+')');
			return;
		}

		var f = files[currentIndex]
			, basename = path.basename(f, '.txt')
			, data = fs.readFileSync(path.resolve(ANNOTATIONS_DIR, f), 'utf8')
			, imageIndex = parseInt(basename)
			, lines = data.toString().split("\n")
			, imageName = lines.shift().replace(/\s/g, '') + '.jpg'
			// , imagePath = path.resolve(__dirname, '../assets/images/'+imageName)
			, imagePath = AWS_IMAGES_PATH + imageName
			, imageSize
			, image = [imageName, null, null]
			, annotations;

		// remove empty line at end
		lines.pop();

		// map annotations
		annotations = lines.map(function(line) {
			var parts = line.split(',');
			return [parseFloat(parts[0]), parseFloat(parts[1])];
		}); 

		console.log('imageIndex: '+imageIndex)
		out[imageIndex] = [image, annotations];

		var getObjectParams = {
			Bucket: HELEN_BUCKET
			, Key: imagePath
		}

		// console.log('attempt to get '+getObjectParams.Key);

		s3.getObject(getObjectParams, function(err, data) {
			if(err) {
				checkDone(err, currentIndex);
			} else {
				// console.log('got response for '+getObjectParams.Key);

				lwip.open(data.Body, "jpg", function(err, imgObj) {
					if(err) {
						checkDone(err, currentIndex);
					} else {
						// set height/width
						image[1] = imgObj.width();
						image[2] = imgObj.height();
						console.log('updated image', image);
						checkDone(null, currentIndex);
					}
				});
			}
		});


		// if(fs.existsSync(imagePath)) {
		// 	imageSize = sizeOf(imagePath);
		// 	image[1] = imageSize.width;
		// 	image[2] = imageSize.height;
		// }

		// console.log(imagePath, imageSize);


	};

	function checkDone(err, currentIndex) {
		if(err) console.log(err);

		console.log("DONE: "+currentIndex);

		remaining--;

		if(remaining <= 0) {
			done();
		} else {
			next(currentIndex+1);
		}
	}


	function done() {
		// remove null at beginning
		out.shift();

		csv = out.map(function(d, i) {
			return i + ',' + d[0].join(',');
		}).join("\n");

		// write file
		fs.writeFile(path.resolve(__dirname, '../assets/annotations.json'), JSON.stringify(out), 'utf8');
		fs.writeFile(path.resolve(__dirname, '../assets/helen.csv'), csv, 'utf8');
	}
});