var fs = require('fs');
var path = require('path');

exports.getDirectories = function(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
};

exports.random = function(min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}
	return min + Math.floor(Math.random() * (max - min + 1));
};

exports.plural = function(number, one, two, five) {
	number = Math.abs(number);
	number %= 100;
	if (number >= 5 && number <= 20) {
		return five;
	}
	number %= 10;
	if (number == 1) {
		return one;
	}
	if (number >= 2 && number <= 4) {
		return two;
	}
	return five;
};

exports.capitalize = function(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

exports.range = function(start, stop, step) {
	if (stop == null) {
		stop = start || 0;
		start = 0;
	}
	step = step || 1;

	var length = Math.max(Math.ceil((stop - start) / step), 0);
	var range = Array(length);

	for (var idx = 0; idx < length; idx++, start += step) {
		range[idx] = start;
	}

	return range;
};

exports.shuffle = function(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};

exports.intervalString = function(ms) {
	if (ms < 1000) {
		return 'меньше секунды';
	}
	var min = Math.floor(ms / 60000);
	var sec = Math.floor(ms % 60000 / 1000);
	var spentStr = '';
	if (min) {
		spentStr = min + ' ' + exports.plural(min, 'минуту', 'минуты', 'минут');
		if (!sec) {
			spentStr = 'ровно ' + spentStr
		} else {
			spentStr += ' ';
		}
	}
	if (sec) {
		spentStr += sec + ' ' + exports.plural(sec, 'секунду', 'секунды', 'секунд');
	}
	return spentStr;
};

exports.isRetina = function(){
	return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2)) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
};

exports.localStorage = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
};

exports.formatNum = function(n) {
	if (isNaN(n) || n === undefined || n === null) return '?';
	var s = String(Math.round(n * 10) / 10); // round
	return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(/\./, ',');
};

exports.colorInRange = function(value, colors) {
	var numberOfSections = colors.length - 1;
	var sectionSize = 1 / numberOfSections;
	for (var i=0; i <= numberOfSections; i++) {
		if (sectionSize * i <= value && value <= sectionSize * (i + 1)) {
			var scale = (value - (sectionSize * i)) / sectionSize;
			return [
				Math.round(colors[i][0] + (colors[i+1][0] - colors[i][0]) * scale),
				Math.round(colors[i][1] + (colors[i+1][1] - colors[i][1]) * scale),
				Math.round(colors[i][2] + (colors[i+1][2] - colors[i][2]) * scale)
			]
		}
	}
	return colors[colors.length - 1];
};

exports.hexToRgb = function(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
};
