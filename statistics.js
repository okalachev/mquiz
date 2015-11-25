var assert = require('assert');
var extend = require('extend');
var Q = require('q');
var stuff = require('./stuff');
var stats = require('stats-lite');
var mongo = require('./mongo');
var quiz = require('./quiz/quiz');

var sumReduce = function (key, values) { return Array.sum(values) };
var sortByValue = function(items) {
	return items.sort(function(a, b) {
		return b.value - a.value;
	});
};
var games = mongo.get('games');

function mapReduce(map, reduce, out, scope, finalize) {
	var d = Q.defer();
	games.col.mapReduce(map, reduce, { scope: scope, out: out || { inline: 1 }, finalize: finalize }, function(err, res) {
		assert.equal(err, null);
		d.resolve(res);
	});
	return d.promise;
}

function aggregate(pipeline, out) {
	var d = Q.defer();
	games.col.aggregate([pipeline, { $out: out }], function(err) {
		assert.equal(err, null);
		d.resolve();
	});
	return d.promise;
}

/** Common statistics */
function common(q) {
	var gt = quiz.getByName(q).countEmptyGames ? -1 : 0;
	return games.find({ quiz: q, points: { $gt: gt } }, { fields: { percent: true, spent: true } }).then(function(games) {
		var percents = games.map(game => game.percent);
		var percentsRounded = percents.map(Math.round);
		var lessCount = {};
		for (var i = 0; i <= 100; i++) lessCount[i] = 0 ;
		var distribution = {};
		for (i = 0; i < 10; i++) distribution[i] = 0;
		percents.forEach(function(percent) {
			for (i = Math.floor(percent) + 1; i <= 100; i++) lessCount[i]++;
			if (percent < 1) {
				// Count (0...1) values as 1
				percent = 1;
			}
			distribution[Math.floor((percent - 1) / 10)]++;
		});
		return {
			quiz: q,
			games: games.length,
			mean: stats.mean(percents),
			median: stats.median(percents),
			mode: stats.mode(percentsRounded),
			variance: stats.variance(percents),
			stdev: stats.stdev(percents),
			spentTotal: stats.sum(games.map(game => game.spent)), // TODO: fix it - add spent to game object
			lessCount: lessCount,
			distribution: distribution
		};
	});
}

function famous(quiz) {
	return mapReduce(function() {
		if (this.quiz != quiz) return;
		var answers = this.attempts.pop().answers;
		for(var id in answers) {
			if (answers[id] === true) emit(id, 1);
		}
	}, sumReduce, undefined, { quiz: quiz }).then(function(items) {
		return items.sort(function(a, b) {
			return b.value - a.value;
		});
	});
}

function mistakes(quiz) {
	return mapReduce(function() {
		if (this.quiz != quiz) return;
		var emitted = {};
		this.attempts.forEach(function(attempt) {
			for (var id in attempt.answers) {
				var answer = attempt.answers[id];
				if (answer !== true && answer.trim() != '' && !emitted[id + '.' + answer]) {
					emit({ id: id, answer: answer }, 1);
					emitted[id + '.' + answer] = true; // count the same mistake only once
				}
			}
		});
	}, sumReduce, undefined, { quiz: quiz }).then(function(items) {
		return sortByValue(items).slice(0, 20).map(function(mistake) {
			return {
				id: mistake._id.id,
				answer: mistake._id.answer,
				count: mistake.value
			}
		})
	});
}

Q.all(quiz.quizzes.map(function(quiz) {
	// Iterate over all quizzes, calculate their statistics and write to mongodb
	var q = quiz.name;
	return Q.all([
			common(q),
			famous(q),
			mistakes(q)
	]).then(function(data) {
		var stats = data[0];
		stats.famous = data[1];
		stats.mistakes = data[2];
		return mongo.get('stats').update({ quiz: stats.quiz }, stats, { upsert: true });
	});
})).then(function() {
	mongo.close();
}, function(err) {
	mongo.close();
	console.error(err);
});
