var AWS = require('aws-sdk')
	, lwip = require('lwip')

	, s3 = new AWS.S3()

var HELEN_BUCKET = 'helen-images';

// var listParams = {
// 	Bucket: HELEN_BUCKET
// 	, MaxKeys: 10
// }

// // s3.listBuckets(function(err, data) {
// // 	if(err) throw new Error(err);

// // 	data.Buckets.forEach(function(b) {
// // 		console.log(b.Name);
// // 	});
// // });


// s3.listObjects(listParams, function(err, data) {
// 	if(err) throw new Error(err);

// 	console.log(data);
// });


var getObjectParams = {
	Bucket: HELEN_BUCKET
	, Key: "images/100591971_1.jpg"
}

s3.getObject(getObjectParams, function(err, data) {
	if(err) throw new Error(err);

	console.log(data);

	lwip.open(data.Body, "jpg", function(err, image) {
		if(err) throw new Error(err);

		console.log(image.width()+', '+image.height());
	});
});
