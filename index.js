var p5 = require('p5');
var dat = require('exdat');
var Flickr = require('flickrapi');
var _ = require('lodash');
var qs = require('querystring');


var S3_PATH = "https://s3.amazonaws.com/helen-images/images/";
// var JSON_PATH = "assets/annotations.json";
var JSON_PATH = "https://s3.amazonaws.com/helen-images/annotations.json";

// var dataIndex = 1;
var imageName = "";
var imageSize = [];
var annotations;
var img;
var canvas;
var _data;
var gui, guiF1, guiF2;
var query = {};

var RIGHT_EYE_START = 114;
var RIGHT_EYE_END = 133;
var LEFT_EYE_START = 134;
var LEFT_EYE_END = 153;
var MOUTH_OUTLINE_START = 58;
var MOUTH_OUTLINE_END = 85;



if(window.location.search) {
	query = qs.parse(window.location.search.slice(1));
}

if(query.dataIndex) {
	query.dataIndex = parseInt(query.dataIndex);
}

var params = _.defaults(query, {
	showImage: true
	, showAnnotations: true
	, showIndexes: false
	, showCentroids: false
	, centerFace: true
	, targetArea: 200
	, textSize: 10
	, annotationSize: 3
	, dotColor: [255, 255, 255]
	, centroidColor: [0, 0, 255]
	, dataIndex: 1
	, animationFrames: 5
	, isAnimating: false
})

var imageInfo = {
	link: '',
	title: ''
}

var flickr = new Flickr({
	api_key: "f1d7f8566434449bf8b19e8e7b9b2b0c"
});

var sketch = function(p) {
	p.preload = function() {
		_data = p.loadJSON(JSON_PATH, function() { loadData(); });
	}

	p.setup = function() {
		var size = 600; //p.min(p.width, p.height);
		canvas = p.createCanvas(p.windowWidth, p.windowHeight);

		params.targetArea = p.min(p.width, p.height) / 3;

		gui = new dat.GUI();
		guiControls = gui.addFolder('Controls');
		guiImageInfo = gui.addFolder('Image Info');

		guiControls.add(params, 'showImage');
		guiControls.add(params, 'showAnnotations');
		guiControls.add(params, 'showIndexes');
		guiControls.add(params, 'showCentroids');
		guiControls.add(params, 'centerFace');
		guiControls.add(params, 'targetArea');
		guiControls.add(params, 'textSize');
		guiControls.add(params, 'annotationSize');
		guiControls.addColor(params, 'dotColor');
		guiControls.addColor(params, 'centroidColor');
		guiControls.add(params, 'dataIndex')
			.step(1)
			.listen()
			.onChange(loadData);
		guiControls.add(params, 'isAnimating').listen();
		guiControls.add(params, 'animationFrames', 1, 500).step(1);

		guiImageInfo.add(imageInfo, 'link').listen();
		guiImageInfo.add(imageInfo, 'title').listen();
	}

	p.draw = function() {
		var imgWidth
			, imgHeight
			, leftEyeCentroid
			, rightEyeCentroid
			, mouthCentroid
			, triangulatedCentroid
			, annotationScale
			, annotationSize;

		p.background(0);

		p.textAlign(p.CENTER);
		p.textSize(params.textSize);


		if(img) {

			imgHeight = p.height;
			imgWidth = imageSize[0]*(imgHeight/imageSize[1]);
			leftEyeCentroid = findCentroid(annotations.slice(LEFT_EYE_START, LEFT_EYE_END+1));
			rightEyeCentroid = findCentroid(annotations.slice(RIGHT_EYE_START, RIGHT_EYE_END+1));
			mouthCentroid = findCentroid(annotations.slice(MOUTH_OUTLINE_START, MOUTH_OUTLINE_END+1));
			triangulatedCentroid = findCentroid([leftEyeCentroid, rightEyeCentroid, mouthCentroid]);
			var area = (leftEyeCentroid.dist(rightEyeCentroid) + leftEyeCentroid.dist(mouthCentroid) + mouthCentroid.dist(rightEyeCentroid)) / 2;

			
			if(params.centerFace) {
				annotationScale = params.targetArea / area;
			} else {
				annotationScale = imgWidth / imageSize[0];				
			}
			

			annotationSize = params.annotationSize * (1/annotationScale);



			p.push();


				if(params.centerFace) {
					p.translate(
						p.width/2 - triangulatedCentroid.x*annotationScale,
						p.height/2 - triangulatedCentroid.y*annotationScale
					);
				} else {
					p.translate((p.width-imageSize[0]*annotationScale)/2, 0);					
				}

				p.scale(annotationScale);

				if(params.showImage) {
					// console.log('check image ratios', img.width/img.height, imgWidth/imgHeight);
					p.image(img, 0, 0);//, imgWidth, imgHeight);
				}


				if(params.showAnnotations) {

					annotations.forEach(function(coords, index) {
						// var point = mapPoint(coords, imageSize, [imgWidth, imgHeight]);
						var point = coords;

						p.fill(params.dotColor);
						p.noStroke();

						if(params.showIndexes) {
							p.push();
								p.scale(1/annotationScale)
								p.text(index+"", point.x*annotationScale, point.y*annotationScale);
							p.pop();
						} else {
							p.ellipse(point.x, point.y, annotationSize, annotationSize);
						}

					});
				}

				if(params.showCentroids) {

					p.push();
						p.noStroke();
						p.fill(params.centroidColor);
						p.ellipse(leftEyeCentroid.x, leftEyeCentroid.y, annotationSize, annotationSize);
						p.ellipse(rightEyeCentroid.x, rightEyeCentroid.y, annotationSize, annotationSize);
						p.ellipse(mouthCentroid.x, mouthCentroid.y, annotationSize, annotationSize);
						p.ellipse(triangulatedCentroid.x, triangulatedCentroid.y, annotationSize, annotationSize);
					p.pop();
				}

			p.pop();
		}

		if(params.isAnimating && (p.frameCount % params.animationFrames === 0)) {
			params.dataIndex = params.dataIndex+1
			loadData();
			// console.log('animating!', params.dataIndex);
		}

	}

	p.keyTyped = function() {
		if(p.key === 'k') {
			params.dataIndex = params.dataIndex+1;
			loadData();
		} else if(p.key === 'j') {
			if(params.dataIndex-1 > 0) {
				params.dataIndex = params.dataIndex-1;
				loadData();
			}
		} else if (p.key === 's') {
			p.saveCanvas(canvas, 'HELEN_'+params.dataIndex+'.jpg');
		} else if (p.key === ' ') {
			toggleAnimation();
		} else if (p.key === 'o') {
			if(imageInfo && imageInfo.link) {
				window.open(imageInfo.link, '_blank');
			}
		}
	}

	p.windowResized = function() {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
	}


	function toggleAnimation() {
		params.isAnimating = !params.isAnimating;
	}


	function loadData(i) {
		var index = i || params.dataIndex;
		var item = _data[index-1];
		var id;
		imageName = item[0][0];
		imageSize = [item[0][1], item[0][2]];
		annotations = item[1].map(function(d) { return {x:d[0], y:d[1]} });
		img = p.loadImage(S3_PATH+imageName);

		// quick & dirty way to get id
		id = imageName.split('.')[0].split('_')[0];

		flickr.photos.getInfo({
			photo_id: id
		}, function(err, result) {
			if(err) {
				imageInfo.link = 'not available';
				imageInfo.title = 'not available'
			} else {
				var link = result.photo.urls.url[0]._content;
				var title = result.photo.title._content

				imageInfo.link = link || '';
				imageInfo.title = title || '';
			// console.log('Image loaded', url, result);
			}
		});
	}

	function mapPoint(point, imgBaseSize, imgTargetSize) {
		return {
			x: p.map(point.x, 0, imgBaseSize[0], 0, imgTargetSize[0])
			, y: p.map(point.y, 0, imgBaseSize[1], 0, imgTargetSize[1])
		};
	}

	function findCentroid(points) {
		var len = points.length
			, avgX
			, avgY;

		avgX = points.reduce(function(a, b) { return a + b.x; }, 0)/len;
		avgY = points.reduce(function(a, b) { return a + b.y }, 0)/len;

		return p.createVector(avgX, avgY);
	}

	// function loadData(i) {
	// 	var index = i || params.dataIndex;
	// 	var url = 'assets/annotations/'+index+".txt";
	// 	console.log('load data', url);
	// 	p.loadStrings(url, parseData);		
	// }

	// function parseData(data) {
	// 	console.log('data', data);
		
	// 	annotations = data.map(function(d) {
	// 		var parts = d.split(',');

	// 		return {
	// 			x: p.float(parts[0])
	// 			, y: p.float(parts[1])
	// 		};
	// 	});

	// 	img = p.loadImage("assets/images/"+imageName+".jpg");
	// }

}

new p5(sketch);