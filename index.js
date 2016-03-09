var p5 = require('p5');
var dat = require('exdat');

var dataIndex = 1;
var imageName = "";
var annotations;
var img;
var canvas;

var sketch = function(p) {
	p.preload = function() {
		loadData(dataIndex);
	}

	p.setup = function() {
		var size = 600; //p.min(p.width, p.height);
		canvas = p.createCanvas(size, size);
	}

	p.draw = function() {
		var imgWidth
			, imgHeight;

		p.background('#ddd');

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

			p.image(img, 0, 0, imgWidth, imgHeight);

			annotations.forEach(function(coords) {
				var x = p.map(coords.x, 0, img.width, 0, imgWidth);
				var y = p.map(coords.y, 0, img.height, 0, imgHeight);
				p.fill('yellow');
				p.noStroke();
				p.ellipse(x, y, 2, 2);
			});
		}

		p.mouseClicked = function() {
			if(p.mouseX > p.width/2) {
				dataIndex = dataIndex+1;
				console.log('load data index '+dataIndex);
				loadData(dataIndex);
			} else {
				if(dataIndex-1 > 0) {
					dataIndex = dataIndex-1;
					loadData(dataIndex);
				}
			}
		}

	}

	function loadData(i) {
		var url = 'assets/annotations/'+i+".txt";
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