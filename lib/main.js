var quizzes = require('../quiz/quiz');
var stuff = require('../stuff');

$(function() {
	var body = $('body');
	$.scrollTo.defaults.duration = 200;

	if ($('.quizzes').length) {
		function moveCursor() {
			var by = $('.sort-by.current');
			$('.sort .cursor').css({
				left: by.position().left + 20,
				top: by.position().top + 18,
				width: by.width()
			});
		}
		// Sorting
		body.on('click', '.sort .sort-by', function(e) {
			// initial cursor position
			moveCursor();
			$('.sort-by .cursor').appendTo('.sort');
			var by = $(e.target);
			var sort = by.closest('.sort');
			by.siblings('.sort-by').removeClass('current');
			by.addClass('current');
			moveCursor();
			// Sort
			$('.quizzes').addClass('sorting');
			setTimeout(function() {
				tinysort('.quizzes li', {
							attr: 'data-' + by.attr('data-sort'),
							order: by.attr('data-order') || 'desc'
						}
				);
				$('.quizzes').removeClass('sorting');
			}, 200);
		});

		// Load my results
		if (stuff.localStorage()) {
			$('.quizzes li').each(function () {
				var quiz = $(this).attr('data-name');
				var percent = localStorage['result.' + quiz];
				if (percent !== undefined) {
					$(this).find('.stat.my')
						.attr('href', '/' + quiz + '?game=' + localStorage['result.' + quiz + '.session'])
						.show()
						.find('.value').html(Math.round(percent) + ' %');
				}
			});
		}
	}

	function test(q) {
		// fill with test data
		stuff.shuffle(q.entries).slice(0, Math.round(q.entries.length / 3)).forEach(function(entry) {
			q.quizElem.find('.input[data-id=' + entry.id + ']').val(
					Math.random() > .3 ? entry.name : 'xxx'
			).autoGrow(1);
		});
		q.start();
		window.q = q;
	}

	$('.quiz').each(function() {
		var quizElem = $(this);
		var name = quizElem.attr('data-name');
		var quiz = quizzes.getByName(name);
		quiz.init(quizElem);
	});

	body.on('click', '.show-comments', function(e) {
		$(e.target).closest('.comments').html(jade.render('disqus'));
	});

	body.on('click', 'input.link', function(e) {
		$(e.target).select();
	});
});

$.fn.animateBar = function() {
	$(this).find('.bar').each(function() {
		$(this).css('width', $(this).attr('data-width'));
	});
};
