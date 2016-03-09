var p5 = require('p5');
var dat = require('exdat');

// var dataIndex = 1;
var imageName = "";
var annotations;
var img;
var canvas;

var gui;
var params = {
	showImage: true
	, showAnnotations: true
	, annotationSize: 3
	, dotColor: [255, 255, 255]
	, dataIndex: 1
}

var sketch = function(p) {
	p.preload = function() {
		loadData();
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
			.onChange(loadData);
	}

	p.draw = function() {
		var imgWidth
			, imgHeight;

		p.background(0);

		if(img) {

			// rescale to fit canvas
			if(img.width > img.height) {
				imgWidth = p.width;
				imgHeight = img.height*(p.width/img.width);
			} else {
				imgHeight = p.height;
				imgWidth = img.width*(p.height/img.height);
			}

			p.translate((p.width-imgWidth)/2, (p.height-imgHeight)/2);

			if(params.showImage) {
				p.image(img, 0, 0, imgWidth, imgHeight);
			}

			if(params.showAnnotations) {
				annotations.forEach(function(coords) {
					var x = p.map(coords.x, 0, img.width, 0, imgWidth);
					var y = p.map(coords.y, 0, img.height, 0, imgHeight);
					p.fill(params.dotColor);
					p.noStroke();
					p.ellipse(x, y, params.annotationSize, params.annotationSize);
				});
			}
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
		}
	}

	p.windowResized = function() {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
	}



	function loadData(i) {
		var index = i || params.dataIndex;
		var url = 'assets/annotations/'+index+".txt";
		console.log('load data', url);
		p.loadStrings(url, parseData);		
	}

	function parseData(data) {
		console.log('data', data);
		imageName = data.shift();
		
		annotations = data.map(function(d) {
			var parts = d.split(',');

			return {
				x: p.float(parts[0])
				, y: p.float(parts[1])
			};
		});

		img = p.loadImage("assets/images/"+imageName+".jpg");
	}

}




new p5(sketch);