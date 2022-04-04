var assert = require('assert');
var extend = require('extend');
var Q = require('q');
var stuff = require('./stuff');
var stats = require('stats-lite');
var mongo = require('./mongo');
var quiz = require('./quiz/quiz');

function arraySum(arr) {
	return arr.reduce(function(a, b) { return a + b; }, 0);
}

var sumReduce = function (key, values) { return arraySum(values) };
var sortByValue = function(items) {
	return items.sort(function(a, b) {
		return b.value - a.value;
	});
};
var games = mongo.get('games');

function _mapReduce(map, reduce, out, scope, finalize) { // MongoDB mapReduce is deprecated
	var d = Q.defer();
	games.mapReduce(map, reduce, { scope: scope, out: out || { inline: 1 }, finalize: finalize }, function(err, res) {
		assert.equal(err, null);
		d.resolve(res);
	});
	return d.promise;
}

var gamesData;
var gamesPromise = games.find().then(function(date) {
	gamesData = date;
});

// implement deprecated mapReduce
function mapReduce(map, reduce, out, scope, finalize) {
	var d = Q.defer();
	var values = {};
	function emit(key, value) {
		key = JSON.stringify(key);
		if (!values[key]) values[key] = [];
		values[key].push(value);
	}
	gamesPromise.then(function() {
		for (var game of gamesData) {
			if (!scope.quiz || game.quiz != scope.quiz) continue; // FIXME: hack to simplify code
			map.call(JSON.parse(JSON.stringify(game)), emit); // parse-stringify to make a copy
		}
		var result = {};
		for (var key in values) {
			if (values[key].length > 1) {
				result[key] = reduce(JSON.parse(key), values[key]);
			} else {
				result[key] = values[key][0];
			}
		}
		d.resolve(Object.keys(result).map(function(key) { return { _id: JSON.parse(key), value: result[key] }}));
	});
	return d.promise;
}

function aggregate(pipeline, out) {
	var d = Q.defer();
	games.aggregate([pipeline, { $out: out }], function(err) {
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
		var mode = stats.mode(percentsRounded);
		if (mode instanceof Set || mode instanceof Array) {
			mode = Array.from(mode);
		} else if (isNaN(mode)) {
			mode = [];
		} else {
			mode = [mode];
		}
		return {
			quiz: q,
			games: games.length,
			mean: stats.mean(percents),
			median: stats.median(percents),
			mode: mode,
			variance: stats.variance(percents),
			stdev: stats.stdev(percents),
			spentTotal: stats.sum(games.map(game => game.spent)), // TODO: fix it - add spent to game object
			lessCount: lessCount,
			distribution: distribution
		};
	});
}

function famous(quiz) {
	return mapReduce(function(emit) {
		if (this.quiz != quiz) return;
		var answers = this.attempts.pop().answers;
		for(var id in answers) {
			if (answers[id] === true) emit(id, 1);
		}
	}, sumReduce, undefined, { quiz: quiz }).then(function(items) {
		return items.sort(function(a, b) {
			return b.value - a.value;
		}).map(function(item) { item.id = item._id; delete item._id; return item; });
	});
}

function mistakes(quiz) {
	return mapReduce(function(emit) {
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

module.exports = Q.all(quiz.quizzes.map(function(quiz) {
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
		return mongo.get('stats2').update({ quiz: stats.quiz }, stats, { upsert: true, replaceOne: true });
	});
})).then(function() {
	module.parent || mongo.close();
}, function(err) {
	module.parent || mongo.close();
	console.error(err);
});
