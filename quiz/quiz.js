var extend = require('extend');
var fs = require('fs');
var baseQuiz = require('./base');
var mixins = require('./mixins');

// Explicitly require quizzes' modules, to make them visible to browserify
var modules = {
	europe: require('./europe/quiz'),
	mskmetro: require('./mskmetro/quiz'),
	nnmetro: require('./nnmetro/quiz'),
	nskmetro: require('./nskmetro/quiz'),
	omskmetro: require('./omskmetro/quiz'),
	spbmetro: require('./spbmetro/quiz'),
	periodic: require('./periodic/quiz'),
	southpark: require('./southpark/quiz'),
	us: require('./us/quiz'),
	musical: require('./musical/quiz')
};

var quizzes = Object.keys(modules).map(function(name) {
	// Construct the quiz object
	var quiz = extend({}, baseQuiz, { name: name, base: baseQuiz });
	var module = modules[name];
	// Mixins
	(module.mixins || []).forEach(function(mixin) {
		quiz = extend(quiz, mixins[mixin]);
	});
	quiz = extend(quiz, module);
	// Automatically assign styles, maps, logo
	if (fs.existsSync) {
		// Additional styles
		quiz.dir = __dirname + '/' + name;
		if (module.css === undefined && fs.existsSync(quiz.dir + '/style.css')) quiz.css = 'style.css';
		if (module.vectorMap === undefined && fs.existsSync(quiz.dir + '/map.svg')) quiz.vectorMap = 'map.svg';
		if (module.rasterMap === undefined && fs.existsSync(quiz.dir + '/map.png')) quiz.rasterMap = 'map.png';
		if (module.logo === undefined && fs.existsSync(quiz.dir + '/logo.png')) quiz.logo = 'logo.png';
		if (module.logo === undefined && fs.existsSync(quiz.dir + '/logo.svg')) quiz.logo = 'logo.svg';
		// Load svg
		if (quiz.vectorMap) {
			quiz.svgContent = fs.readFileSync(quiz.dir + '/' + quiz.vectorMap);
		}
	}
	quiz.initCache();
	return quiz;
});

exports.quizzes = quizzes;

exports.getByName = function(name) {
	for (var i = 0; i < quizzes.length; i++) {
		if (quizzes[i].name == name) {
			return quizzes[i];
		}
	}
};
