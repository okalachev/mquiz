var assert = require('assert');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var cheerio = require('cheerio');

var IMAGE_WIDTH = 470;
var STROKE_WIDTH = 20;
var STROKE_LENGTH = 60;

module.exports = function(quiz, correct, res) {
	if (quiz.vectorMap) {
		var svgDoc = cheerio.load(quiz.svgContent);
		var root = svgDoc.root();
		// Paint correct and wrong areas
		quiz.svgContext = root;
		quiz.iterate(function(entry) {
			var isCorrect = correct.indexOf(String(entry.id)) != -1;
			quiz.shareImageSetAreaState(quiz.getArea(entry.id), isCorrect, entry);
		});
		// Add background raster image
		if (quiz.rasterMap) {
			var rasterImg = __dirname + '/quiz/' + quiz.name + '/' + quiz.rasterMap;
			root.find('svg').prepend(`<g><image x="0" y="0" width="100%" height="100%" xlink:href="file://${rasterImg}"/></g>`);
		}
		// Remove all text
		root.find('text').remove();
		// Create buffer
		var buf = new Buffer(svgDoc.xml());
		var img = gm(buf);
		done();
	} else if (quiz.rasterMap) { // raster map only
		img = gm(__dirname + '/quiz/' + quiz.name + '/' + quiz.rasterMap);
		// TODO: cache all sizes
		img.size(function(err, size) {
			assert.equal(err, null);
			var k = size.width / quiz.width;
			quiz.entries.forEach(function(entry) {
				var color = correct.indexOf(entry.id) != -1 ? quiz.correctColor : quiz.wrongColor;
				img.stroke(color, STROKE_WIDTH);
				var x = (entry.x || quiz.positions[entry.id].x) + (quiz.inputShiftX || 0);
				var y = (entry.y || quiz.positions[entry.id].y) + (quiz.inputShiftY || 0);
				var align = entry.align || quiz.inputAlign || 'left';
				var direction = align == 'right' ? -1 : 1;
				if (x && y) {
					img.drawLine(
						x * k,
						y * k,
						(x + direction * STROKE_LENGTH) * k,
						y * k
					);
				}
			});
			done();
		});
	} else {
		res.status(406).send('Map not found');
	}

	function done() {
		img
			.resize(IMAGE_WIDTH)
			.stream('png', function (err, stdout, stderr) {
				assert.equal(err, null);
				stderr.pipe(process.stderr);
				stdout.pipe(res);
			});
	}
};

