var should = require('should');
var quiz = require('../quiz/quiz');

describe('Quiz library', function() {
	it('should have quizzess list', function() {
		quiz.quizzes.should.be.an.Array();
	});

	describe('#getByName', function() {
		it('should return the quiz object', function() {
			quiz.getByName('mskmetro').name.should.equal('mskmetro');
			quiz.getByName('europe').name.should.equal('europe');
			quiz.getByName('southpark').name.should.equal('southpark');
		});

		it('should return undefined if there is not such quiz', function() {
			should(quiz.getByName('nosuchquiz')).equal(undefined);
		});
	});

	it('should mix in objects', function() {
		var mixins = require('../quiz/mixins');
		quiz.getByName('spbmetro').getEntryIcon.should.equal(mixins.metro.getEntryIcon);
	});
});

describe('Quiz object', function() {
	var europe = quiz.getByName('europe');

	describe('#getAutocompleteItems', function() {
		it('should return correct items', function() {
			europe.getAutocompleteItems('а').should.eql(["Австрия", "Андорра", "Албания"]);
		});

		it('should return correct items by alter name', function() {
			europe.getAutocompleteItems('ре').should.eql(["Кипр", "Северный Кипр"]);
		});
	});
});
