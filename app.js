var fs = require('fs');
var express = require('express');
var cookieParser = require('cookie-parser')();
var validate = require('validate.js');
var moment = require('moment');
var bcrypt = require('bcrypt');
var mongo = require('./mongo');
var stuff = require('./stuff');
var quiz = require('./quiz/quiz');
var shareimage = require('./shareimage');
var quizzes = quiz.quizzes;

var app = module.exports = express();
app.set('view engine', 'jade');
app.enable('trust proxy');
app.use('/static', express.static('static'));
app.use('/static/quiz/', express.static('quiz'));
app.use('/static/lib', require('browserify-middleware')('./lib', { ignore: './mongo.js' }));
app.use(require('body-parser').json());
app.use(require('compression')());
app.use(require('./metroquiz-redirect'));
var clientTemplates = ['results.jade', 'statistics.jade', 'disqus.jade'];
app.use(require('jade-client-middleware')('/static/templates.js', clientTemplates, {
	root: __dirname + '/views',
	noCache: app.get('env') == 'development'
}));
app.locals.stuff = stuff;
app.locals.moment = moment;

// Redirects from www
app.use(function(req, res, next) {
	if (req.subdomains[0] == 'www') {
		res.redirect(301, 'http://mquiz.ru' + req.originalUrl);
		return;
	}
	next();
});

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
		foreign: req.query.foreign,
		title: q.title,
		ogtitle: req.query.title,
		description: q.description || q.subtitle,
		keywords: q.keywords,
		image: req.query.image || 'http://mquiz.ru/static/quiz/' + q.name + '/' + q.logo,
		tryalso: stuff.shuffle(quizzes.filter(e => e != q)).slice(0, 3) // 3 random quizzes except the current
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
	if (req.body.resumed) {
		attempt.resumed = true;
	}
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
		}).then(function(doc) {
			res.send(String(doc._id));
		});
	} else {
		// Non-first attempt
		query = mongo.get('games').findOneAndUpdate({ _id: req.body.session }, {
			$set: {
				points: attempt.points,
				percent: attempt.percent,
				spent: attempt.spent
			},
			$push: { attempts: attempt }
		}).then(() => res.sendStatus(200));
	}
	query.catch(function(err) { console.error(err) });
	// Pre-generate and cache share images to send them rapidly
	shareimage(req.quiz, results.correctIds, 'vk');
	shareimage(req.quiz, results.correctIds, 'fb');
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

// Share image
app.get('/' + quizRoute + '/shareimage', function(req, res) {
	var type = req.query._type || '';
	delete req.query._type;
	shareimage(req.quiz, Object.keys(req.query), type, res);
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
	mongo.get('games').find({}, { attempts: false }).then(
		games => res.render('iddqd', { games: games.sort((a, b) => b.datetime - a.datetime) }),
		err => next(err)
	);
});

function reloadStats() {
	return mongo.get('stats2').find().then(function(allStats) {
		allStats.forEach(stats => quiz.getByName(stats.quiz).stats = stats);
		// Re-sort quizzes
		quizzes.sort((a, b) => (b.stats.games || -1) - (a.stats.games || -1)); // by popularity
	}, function(err) {
		console.error("Couldn't fetch stats from Mongo.", err);
	});
}
// Automatically reload stats
setInterval(reloadStats, process.env.STATS_RELOAD_PERIOD || 3 * 60 * 60 * 1000);

// Load all the stats before start
reloadStats().then(function() {
	if (module.parent) return;
	var server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening at host %s at port %s', server.address().address, server.address().port);
	});
});
