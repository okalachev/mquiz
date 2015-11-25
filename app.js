var fs = require('fs');
var express = require('express');
var cookieParser = require('cookie-parser')();
var validate = require('validate.js');
var moment = require('moment');
var bcrypt = require('bcrypt');
var mongo = require('./mongo');
var stuff = require('./stuff');
var quiz = require('./quiz/quiz');
var quizzes = quiz.quizzes;

var app = module.exports = express();
app.set('view engine', 'jade');
app.enable('trust proxy');
app.use('/static', express.static('static'));
app.use('/static/quiz/', express.static('quiz'));
app.use('/static/lib', require('browserify-middleware')('./lib', { ignore: './mongo.js' }));
app.use(require('body-parser').json());
app.use(require('./metroquiz-redirect'));
var clientTemplates = ['results.jade', 'statistics.jade', 'disqus.jade'];
app.use(require('jade-client-middleware')('/static/templates.js', clientTemplates, {
	root: __dirname + '/views',
	noCache: app.get('env') == 'development'
}));
app.locals.stuff = stuff;
app.locals.moment = moment;


var quizRoute = ':quiz(' + quizzes.map(function(quiz) {
   return quiz.name;
}).join('|') + ')';

// Quizzes list
app.get('/', function (req, res) {
	//res.json(quizzes);
	res.render('list', { quizzes });
});

// Every quiz page
app.use('/' + quizRoute, function(req, res, next) {
	req.quiz = quiz.getByName(req.params.quiz);
	next();
});

// Quiz
app.get('/' + quizRoute, function(req, res) {
	var q = req.quiz;
	res.render('quiz', {
		quiz: q,
		show: req.query.game,
		title: q.title,
		description: q.description || q.subtitle,
		keywords: q.keywords,
		image: 'http://mquiz.ru/static/quiz/' + q.name + '/' + q.logo,
		tryalso: stuff.shuffle(quizzes.filter(e => e != q)).slice(0, 3) // 3 random quizzess except the current
	});
});

// Register result
app.post('/' + quizRoute + '/register', function(req, res) {
	// Validate the post data
	if(validate(req.body, {
		spent: { numericality: { onlyInteger: true }},
		maxPoints: { numericality: { onlyInteger: true }}
	})) return res.sendStatus(422);

	var results = req.quiz.calculateResults(req.body.answers);
	var attempt = {
		points: results.correct,
		spent: req.body.spent,
		percent: results.percent,
		answers: {}
	};
	Object.keys(results.answers).forEach(function(id) {
		if (results.answers[id] == 'correct') {
			attempt.answers[id] = true;
		} else if (req.body.answers[id]) {
			attempt.answers[id] = req.body.answers[id];
		}
	});
	if (!req.body.session) {
		// First attempt
		var query = mongo.get('games').insert({
			quiz: req.quiz.name,
			addr: req.ip,
			datetime: new Date,
			maxPoints: req.body.maxPoints,
			points: attempt.points,
			percent: attempt.percent,
			spent: attempt.spent,
			attempts: [attempt]
		}).success(function(doc) {
			res.send(String(doc._id));
		});
	} else {
		// Non-first attempt
		query = mongo.get('games').updateById(req.body.session, {
			$set: {
				points: attempt.points,
				percent: attempt.percent,
				spent: attempt.spent
			},
			$push: { attempts: attempt }
		}).success(() => res.sendStatus(200));
	}
	query.error(function(err) { console.error(err) });
});

app.get('/game', function(req, res) {
	mongo.get('games').findOne({ _id: req.query.session }).then(function(game) {
		res.json(game);
	}, function() {
		res.send(404);
	});
});

// Quiz statistics
app.get('/' + quizRoute + '/statistics', function(req, res) {
	res.json(req.quiz.stats);
});

// Result image
app.get('/' + quizRoute + '/shareimage', function(req, res) {
	require('./shareimage')(req.quiz, Object.keys(req.query), res);
});

var secretCodeHash = process.env.SECRET_CODE_HASH;

function admin(req, res, next) {
	if (!secretCodeHash || bcrypt.compareSync(req.cookies.secret_code || '', secretCodeHash)) {
		next();
	} else {
		res.sendStatus(403);
	}
}

app.get('/fetch', cookieParser, admin, function(req, res) {
	reloadStats().then(() => res.sendStatus(200));
});

app.get('/iddqd', cookieParser, admin, function(req, res, next) {
	mongo.get('games').find().then(
		games => res.render('iddqd', { games: games.sort((a, b) => b.datetime - a.datetime) }),
		err => next(err)
	);
});

function reloadStats() {
	return mongo.get('stats').find().then(function(allStats) {
		allStats.forEach(stats => quiz.getByName(stats.quiz).stats = stats);
		// Re-sort quizzess
		quizzes.sort((a, b) => (b.stats.games || -1) - (a.stats.games || -1)); // by popularity
	}, function(err) {
		console.error("Couldn't fetch stats from Mongo.", err);
	});
}
// Automatically reload stats
setInterval(reloadStats, process.env.STATS_RELOAD_PERIOD || 3 * 60 * 60 * 1000);

// Load all the stats before start
reloadStats().all(function() {
	if (module.parent) return;
	var server = app.listen(3000, function () {
		console.log('Listening at host %s at port %s', server.address().address, server.address().port);
	});
});
