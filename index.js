var p5 = require('p5');
var dat = require('exdat');

// var dataIndex = 1;
var imageName = "";
var imageSize = [];
var annotations;
var img;
var canvas;
var _data;


var gui;
var params = {
	showImage: true
	, showAnnotations: true
	, annotationSize: 3
	, dotColor: [255, 255, 255]
	, dataIndex: 1
	, isAnimating: false
}

var sketch = function(p) {
	p.preload = function() {
		_data = p.loadJSON('assets/annotations.json', function() { loadData(); });
	}

	p.setup = function() {
		var size = 600; //p.min(p.width, p.height);
		canvas = p.createCanvas(p.windowWidth, p.windowHeight);

		gui = new dat.GUI();

		gui.add(params, 'showImage');
		gui.add(params, 'showAnnotations');
		gui.add(params, 'annotationSize');
		gui.addColor(params, 'dotColor');
		gui.add(params, 'dataIndex')
			.step(1)
			.listen()
			.onChange(loadData);
	}

	p.draw = function() {
		var imgWidth
			, imgHeight;

		p.background(0);

		if(img) {

			// rescale to fit canvas
			// if(imageSize[0] > imageSize[1]) {
			// 	imgWidth = p.width;
			// 	imgHeight = imageSize[1]*(imgWidth/imageSize[0]);
			// } else {
				imgHeight = p.height;
				imgWidth = imageSize[0]*(imgHeight/imageSize[1]);
			// }

			p.translate((p.width-imgWidth)/2, (p.height-imgHeight)/2);

			if(params.showImage) {
				console.log('check image ratios', img.width/img.height, imgWidth/imgHeight);
				p.image(img, 0, 0, imgWidth, imgHeight);
			}

			if(params.showAnnotations) {

				annotations.forEach(function(coords) {
					var x = p.map(coords.x, 0, imageSize[0], 0, imgWidth);
					var y = p.map(coords.y, 0, imageSize[1], 0, imgHeight);
					p.fill(params.dotColor);
					p.noStroke();
					p.ellipse(x, y, params.annotationSize, params.annotationSize);
				});
			}
		}

		if(params.isAnimating && (p.frameCount % 5 == 0)) {
			params.dataIndex = params.dataIndex+1
			loadData();
			console.log('animating!', params.dataIndex);
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
		imageName = item[0][0];
		imageSize = [item[0][1], item[0][2]];
		annotations = item[1].map(function(d) { return {x:d[0], y:d[1]} });
		img = p.loadImage('assets/images/'+imageName);
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