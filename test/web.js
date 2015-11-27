process.env.MONGO_URI = 'localhost/mquiz_test';
process.env.SECRET_CODE_HASH = '$2a$08$QdE4mBS0oRrlPKPepxCOqOOJeKEq/XKYYIOBuFzdaHeRWvEzSj6D6'; // password123

var EventEmitter = require('events');
delete require.cache[require.resolve('../app')]; // to ensure that the test db is used
var app = require('../app');
var request = require('supertest-as-promised')(app);

EventEmitter.defaultMaxListeners = 0;

describe('Web server', function() {
	it('should return the home page', () => request.get('/').expect(200));

	describe('Quizzes pages', function() {
		var quiz = require('../quiz/quiz');
		for (quiz of quiz.quizzes) {
			it(`should return the ${quiz.name} quiz page`, () => request.get('/' + quiz.name).expect(200));

			it(`should return the ${quiz.name} quiz statistics`, function() {
				return request
					.get(`/${quiz.name}/statistics`)
					.expect(200)
					.expect('content-type', 'application/json; charset=utf-8')
			});
		}
	});

	describe('Register try', function() {
		it('should return 422 if spent is not an integer', function() {
			return request
				.post('/europe/register')
				.send({ spent: 15.5, maxPoints: 15, answers: [] })
				.expect(422)
		});

		//it('should return 422 if maxPoint is not an integer', function(done) {
		//	request(app)
		//		.post('/europe/register')
		//		.send({ spent: 15, maxPoints: 15.5, answers: [] })
		//		.expect(422, done);
		//});

		//it('should return 422 if required fields were not passed', function(done) {
		//	request(app)
		//		.post('/europe/register')
		//		.send({})
		//		.expect(422, done);
		//});
	});

	describe('Statistics', function() {
		var mongo = require('../mongo');

		before('Clear games collection', () => mongo.get('games').remove());

		it('should be calculated correctly', function() {
			this.timeout(0);
			var session;
			return request
				.post('/europe/register')
				.send({
					spent: 20,
					answers: { 0: 'Исландия', 9: 'Белоруссия', 10: 'xxx', 11: 'yyy' } // 2 correct
				})
				.expect(200, /^.{24}$/) // session
			.then(() => request // first attempt, should not be counted
				.post('/europe/register')
				.send({
					spent: 1,
					answers: { 0: 'Исландия' }
				})
				.expect(200, /^.{24}$/) // session
				.expect(res => session = res.text)
			)
			.then(() => request // second attempt
				.post('/europe/register')
				.send({
					spent: 30,
					session,
					answers: { 0: 'Исландия', 9: 'Белоруссия', 10: 'Польша', 11: 'Греция', 12: 'xxx' } // 4 correct
				})
				.expect(200, 'OK')
			)
			.then(() => request
				.post('/europe/register')
				.send({ spent: 50, answers: {}}) // should not be counted
				.expect(200, /^.{24}$/) // session
			)
			.then(() => request
				.post('/europe/register')
				.send({
					spent: 30,
					answers: { 0: 'Исландия', 9: 'xxx', 10: 'Польша', 11: 'Греция', 12: 'xxx' } // 3 correct
				})
				.expect(200)
				.expect(/^.{24}$/)
			)
			.then(function() {
				require('../statistics');
				return request
					.get('/europe/statistics')
					.expect(200)
					.expect(res => res.body.should.have.properties(require('./fixtures/stats.json')))
			})
		});
	});

	describe('Admin pages', function() {
		it('should return 403 on no password', function() {
			return request
				.get('/fetch')
				.expect(403);
		});

		it('should return 403 on wrong password', function() {
			return request
				.get('/fetch')
				.set('Cookie', ['secret_code=wrong_password'])
				.expect(403);
		});

		it('should return 200 on correct password', function() {
			return request
				.get('/fetch')
				.set('Cookie', ['secret_code=password123'])
				.expect(200);
		});
	});

	describe('Redirect form www.-', function() {
		it('should work', function() {
			return request
				.get('/somepage?param=13')
				.set('Host', 'www.mquiz.ru')
				.expect(301)
				.expect('Location', 'http://mquiz.ru/somepage?param=13')
		})
	});

	describe('Redirect from the old site', function() {
		it('should work at the home page', function() {
			return request
				.get('/')
				.set('Host', 'metroquiz.ru')
				.expect(302)
				.expect('Location', 'http://mquiz.ru/mskmetro')
		});

		it('should work from www.-', function() {
			return request
				.get('/')
				.set('Host', 'www.metroquiz.ru')
				.expect(302)
				.expect('Location', 'http://mquiz.ru/mskmetro')
		});

		it('should keep the querystring', function() {
			return request
				.get('/?xxx=666')
				.set('Host', 'metroquiz.ru')
				.expect(302)
				.expect('Location', 'http://mquiz.ru/mskmetro?xxx=666')
		});

		it('should work at the share image keeping the querystring', function() {
			return request
				.get('/result-image?xxx=666&yyy=777')
				.set('Host', 'metroquiz.ru')
				.expect(302)
				.expect('Location', 'http://mquiz.ru/mskmetro/shareimage?xxx=666&yyy=777')
		});

		it('should return 404 at a non-existing page', function() {
			return request
				.get('/nosuchpage')
				.set('Host', 'metroquiz.ru')
				.expect(404)
		});
	});
});
