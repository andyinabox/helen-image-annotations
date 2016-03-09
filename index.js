var p5 = require('p5');
var dat = require('exdat');

var dataName = "2";
var imageName = "";
var annotations;
var img;
var canvas;

var sketch = function(p) {
	p.preload = function() {
		p.loadStrings('assets/annotations/'+dataName+".txt", parseData);
	}

	p.setup = function() {
		var size = 600; //p.min(p.width, p.height);
		canvas = p.createCanvas(size, size);
	}

	p.draw = function() {
		if(img) {
			p.image(img, 0, 0, p.width, p.height);

			annotations.forEach(function(coords) {
				var x = p.map(coords.x, 0, img.width, 0, p.width);
				var y = p.map(coords.y, 0, img.height, 0, p.height);
				p.fill('yellow');
				p.noStroke();
				p.ellipse(x, y, 2, 2);
			});
		}

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