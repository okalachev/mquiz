var stuff = require('../stuff');
require('./jquerysvg');

const JQ_EMPTY = typeof $ != 'undefined' ? $([]) : undefined;

// Base object for quizzes
module.exports = {
	title: undefined,
	subtitle: undefined,
	titleAcc: undefined,
	titleGen: undefined,
	logo: '../default-logo.svg',
	color: undefined,
	foreColor: undefined,
	rasterMap: undefined,
	vectorMap: undefined,
	added: new Date(0),
	width: 600,
	previewWidth: 400,
	entries: [],
	minAutocompleteLength: 3,
	inputShiftX: 0,
	inputShiftY: 0,
	inputAlign: 'left',
	inputPlaceholder: undefined,
	hiddenInputs: false,
	inputStyle: {},
	correctColor: '#3EC259',
	wrongColor: '#D5453C',
	middleColor: '#E0DD2B',
	outcomes: [
		[0, 'Очень плохо'],
		[5, 'Плохо', 'продолжай, у тебя получится лучше!'],
		[30, 'Посредственно', 'продолжай, у тебя получится лучше!'],
		[50, 'Выше среднего'],
		[70, 'Хорошо'],
		[90, 'Отлично'],
		[80, 'Великолепно', 'очень хороший результат'],
		[95, 'Браво', 'невероятный результат!'],
		[100, 'Безупречно', 'вы, часом, не читер?']
	],
	stats: {},
	countEmptyGames: false, // Should games with zero result be counted in statistics
	description: '',
	keywords: [],
	mixins: [],
	entryTitleAcc: 'названия',

	getEntryIcon: function() {},

	/* Called once for each entry */
	getArea: function(id) {
		return this.svgContext ? this.svgContext.find('#' + id + ', #e' + id + ', #e' + id + '_1_' + ', #e' + id + '_2_') : JQ_EMPTY;
	},

	paintArea: function(area, color) {
		// Paint the area for heatmap
		area.css('fill', color);
		area.find('path').css('fill', color);
	},

	getAreaRect: function(entry) {
		if (!entry.area.length) {
			return {};
		}
		//var rect = entry.area.position() || {};
		var bounding = entry.area[0].getBoundingClientRect(); // .position returns incorrect width/height for SVG elements
		var svgBounding = this.svgContext[0].getBoundingClientRect();
		var rect = {
			left: bounding.left - svgBounding.left,
			top: bounding.top - svgBounding.top
		};
		rect.width = bounding.width;
		rect.height = bounding.height;
		rect.centerLeft = rect.left + rect.width / 2;
		rect.centerTop = rect.top + rect.height / 2;
		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;
		return rect;
	},

	getInputPosition: function(entry) {
		return {
			x: entry.areaRect.centerLeft,
			y: entry.areaRect.centerTop
		};
	},

	shareImageSetAreaState: function(area, correct, entry) {
		var color = correct ? this.correctColor : this.wrongColor;
		if (area.is('line')) {
			area.css('stroke', color);
		} else {
			area
				.css('fill', color)
				.find('*').css('fill', color);
		}
	},

	initCache: function() {
		// Fill entries by id cache
		this.entriesById = {};
		this.entries.forEach(function(entry) {
			this.entriesById[entry.id] = entry;
		}, this);
		// Fill entries' haystacks
		this.entries.forEach(function(entry) {
			entry.stack = [this.normalizeAnswer(entry.name)];
			entry.stackOrig = [entry.name];
			if (entry.alter) {
				entry.stack = entry.stack.concat(entry.alter.map(function(name) {
					return this.normalizeAnswer(name)
				}, this));
				entry.stackOrig = entry.stackOrig.concat(entry.alter);
			}
		}, this);
	},

	/** Check answer for an entry, and return the answer in its original form */
	checkCorrect: function(id, answer) {
		var res = false;
		var entry = this.entriesById[id];
		answer = this.normalizeAnswer(answer);
		entry.stack.some(function(name, i) {
			if (answer == name) {
				res = entry.stackOrig[i];
				return true;
			}
		}, this);
		return res;
	},

	/** Condition to paint the area orange */
	checkSemiCorrect: function(entry1, entry2) {
		return false;
	},

	normalizeAnswer: function(s) {
		return s.trim().toLowerCase().replace(/ё/g,'е');
	},

	/** Iterate over the entries and return the first returned (truthy) value */
	iterate: function(fn) {
		var res;
		this.entries.some(function(entry) {
			return res = fn.call(this, entry);
		}, this);
		return res;
	},

	/** Init game in browser */
	init: function(elem) {
		var self = this;
		this.initCache();

		this.quizElem = elem;
		this.vectorMap && this.quizElem.addClass('svg');
		this.rasterMap && this.quizElem.addClass('raster');
		this.quizElem.addClass(this.mixins.join(' '));
		this.quizElem.addClass(this.hiddenInputs ? 'inputs-hidden' : 'inputs-shown');
		this.mapElem = this.quizElem.find('.map');

		$.getJSON('/' + this.name + '/statistics').done(function(stats) {
			self.stats = stats;
		});

		function valueEntered(input) {
			var val = input.val();
			var ready = Boolean(val.trim());
			if(val.trim()) {
				var normalized = self.iterate(function(entry) {
					return self.checkCorrect(entry.id, val);
				});
				input.val(normalized || stuff.capitalize(val));
			} else {
				self.hiddenInputs && input.removeClass('shown');
			}
			self.entriesById[input.attr('data-id')].area
					.removeClassSVG('current')
					.toggleClassSVG('ready', ready);
			input
					.toggleClass('ready', ready)
					.attr('data-state', '')
					.attr('data-last-value', val)
					.css('width', 90)
					.autoGrow(1);
			self.updateCounter();
		}
		this.quizElem
			.on('click', 'button.start', this.start.bind(this))
			.on('click', '.continue', this.kontinue.bind(this))
			.on('click', 'button.finish', this.finish.bind(this))
			.on('click', '.show-statistics', this.showStatistics.bind(this))
			.on('click', '.show-heatmap', this.toggleHeatMap.bind(this))
			.on('click', '.map', function() {
				if (self.quizElem.is('.statistics.realsize')) {
					self.quizElem.removeClass('realsize');
					self.grow(false);
				} else if(self.quizElem.is('.statistics')) {
					self.grow(true, function() {
						self.quizElem.addClass('realsize');
					});
				} else if (self.quizElem.hasClass('results')) {
					self.kontinue();
				}
			})
			.on('keydown', '.map .input', function(e) {
				var input = $(e.target);
				if (e.keyCode == 13) {
					self.hiddenInputs && input.blur();
				} else if (e.keyCode == 27) {
					input.val(input.attr('data-last-value'));
					input.blur();
				}
				e.stopPropagation();
			})
			.on('change', '.map .input', function(e) {
				var input = $(e.target);
				input.attr('data-state', '');
				self.entriesById[input.attr('data-id')].area.attr('data-state', '');
			})
			.on('blur', '.map .input', function(e) {
				valueEntered($(e.target));
			})
			.on('focus', '.map .input', function(e) {
				var input = $(e.target);
				// TODO: merge with areaClick
				input.addClass('shown').select();
				self.entriesById[input.attr('data-id')].area.addClassSVG('current');
				if (!input.attr('data-ac-inited') && self.minAutocompleteLength) {
					input.autocomplete({
						source: function(req, res) {
							res(self.getAutocompleteItems(req.term));
						},
						select: function(e, ui) {
							$(this).val(ui.item.value);
							valueEntered($(this));
							//$(this).val(ui.item.value).autoGrow(0);
						},
						position: {
							at: 'left bottom+5'
						},
						autoFocus: true,
						minLength: self.minAutocompleteLength,
						delay: 0
					}).attr('data-ac-inited', true);
				}
			});
		$('body').on('click', function(e) {
			if (!$(e.target).closest(self.quizElem).length) { // Outer click
				if (self.quizElem.is('.statistics.realsize')) {
					self.quizElem.removeClass('realsize');
					self.grow(false);
				}
			}
		});
		// Map area hover
		//this.svgContext = this.quizElem.find('object').length ? $(this.quizElem.find('object').get(0).contentDocument) : $([]);
		this.svgContext = this.quizElem.find('svg');
		this.height = this.height || this.svgContext.height();
		this.quizElem.find('.side').css('min-height', this.height * this.previewWidth / this.width);
		//this.svgContext.attr('width', '100%');
		//this.svgContext.attr('height', 'auto');

		// Init areas' elements
		this.quizElem.addClass('realsize');
		this.iterate(function(entry) {
			entry.area = this.getArea(entry.id)
					.attr('data-id', entry.id)
					.addClassSVG('area');
			entry.areaRect = this.getAreaRect(entry);
		});
		this.svgContext.on('click', '.area', function(e) {
			self.areaClick($(e.currentTarget));
		});
		self.createInputs();
		this.quizElem.removeClass('realsize');

		if (this.quizElem.attr('data-show')) {
			this.show = this.quizElem.attr('data-show'); // disable animations
			this.foreign = Boolean(this.quizElem.attr('data-foreign'));
			this.resumed = true;
			this.session = this.show;
			$.getJSON('/game', { session: this.show }).done(function(game) {
				// Fill shown data
				var attempt = game.attempts.pop();
				var answers = attempt.answers;
				self.shownSpent = attempt.spent;
				for (var id in answers) {
					var val = answers[id] === true ? self.entriesById[id].name : answers[id];
					self.mapElem.find('.input[data-id=' + id + ']')
						.val(val)
						.addClass('ready shown')
						.autoGrow(1);
				}
				self.start();
				self.finish();
				self.show = false;
			})
		}
	},

	createInputs: function() {
		this.iterate(function(entry) {
			entry.align = entry.align || this.inputAlign;
			var pos = this.getInputPosition(entry);
			entry.inputPosition = {
				x: entry.x || pos.x,
				y: entry.y || pos.y
			};
			var input = $('<input/>')
				.addClass('input')
				.addClass(entry.align || this.inputAlign)
				.attr('autocomplete', 'off')
				.attr('spellcheck', 'false')
				.attr('placeholder', this.inputPlaceholder || entry.placeholder)
				.attr('data-state', '')
				.attr('data-id', entry.id)
				.css(this.inputStyle)
				.css('top', entry.inputPosition.y + (entry.shiftY || this.inputShiftY || 0))
				.appendTo(this.mapElem)
				.autoGrow(1);

			var shiftX = entry.shiftX || this.inputShiftX || 0;
			if (entry.align == 'right') {
				input.css('right', this.width - entry.inputPosition.x + shiftX)
			} else {
				input.css('left', entry.inputPosition.x + shiftX)
			}
		});
	},

	start: function() {
		var self = this;
		this.updateCounter();
		this.quizElem.removeClass('start');

		// Show inputs animated
		setTimeout(function() {
			self.quizElem.find('.input').each(function(i) {
				var input = $(this);
				if (!self.hiddenInputs) {
					setTimeout(function () {
						input.addClass('shown');
					}, self.show ? 0 : i * 15);
				}
			});
		}, self.show ? 0 : 500); // After the grow transition

		this.started = new Date;
		this.kontinue();
	},

	kontinue: function() {
		var self = this;
		this.grow(true, function() {
			self.quizElem.removeClass('results');
			self.svgContext.addClassSVG('progress');
			self.quizElem.addClass('progress');
			self.quizElem.find('.input:not([data-state="correct"])').attr('disabled', false);
			//self.quizElem.find('.bottom').sticky({ bottomSpacing: 20 }); // TODO: fix
		});
	},

	/* Applies grow effect to the quiz preview */
	grow: function(grow, callback) {
		var self = this;
		var DURATION = 200;
		if (this.show) return callback();
		if (grow) {
			this.quizElem.addClass('transition grow');
		} else {
			this.quizElem.addClass('grow');
			setTimeout(function() { self.quizElem.addClass('transition').removeClass('grow') }, 1);
		}
		setTimeout(function() { self.quizElem.removeClass('transition grow') }, DURATION);
		setTimeout(callback, DURATION);
	},

	getAutocompleteItems: function(term) {
		term = this.normalizeAnswer(term);
		return this.entries.filter(function(entry) {
			return entry.stack.some(function(name) {
				return name.indexOf(term) == 0;
			});
		}, this).map(function(entry) {
			return entry.name;
		}, this);
	},

	updateCounter: function() {
		var count = this.quizElem.find('.input.ready').length;
		this.quizElem.find('.counter .inner').css('margin-top', -count * 50);
		var finish = this.quizElem.find('button.finish');
		finish.html(finish.attr(count == this.entries.length ? 'data-all' : 'data-regular'));
	},

	areaClick: function(area) {
		if (area.attr('data-state') == 'correct') {
			return;
		}
		var id = area.attr('data-id');
		this.svgContext.find('.area').removeClassSVG('current');
		area.addClassSVG('current');
		this.quizElem.addClass('input');
		this.quizElem.find('.input[data-id=' + id + ']').addClass('shown').select().focus();
	},

	finish: function() {
		var self = this;
		// Collect answers
		this.answers = {};
		this.iterate(function(entry) {
			this.answers[entry.id] = this.quizElem.find('.input[data-id=' + entry.id + ']').val();
		}, this);
		this.results = this.calculateResults(this.answers);
		Object.keys(this.results.answers).forEach(function(id) {
			var state = this.results.answers[id] || '';
			this.entriesById[id].area.attr('data-state', state);
			this.quizElem.find('input[data-id=' + id + ']')
				.attr('data-state', state)
				.attr('disabled', this.results.answers[id] == 'correct' ? 'disabled' : undefined);
		}, this);
		this.svgContext.removeClassSVG('progress');
		this.quizElem.addClass('results').removeClass('progress');
		if (this.results.correct == this.results.total) {
			this.quizElem.addClass('flawless');
		}
		this.grow(false, function() {
			self.quizElem.animateBar();
			$.scrollTo(self.quizElem);
		});
		this.quizElem.find('.input').attr('disabled', true);
		this.renderResults();
		if (!this.foreign && !this.show) {
			this.registerAttempt();
		}
	},

	showStatistics: function() {
		this.quizElem
			.addClass('statistics')
			.find('.statistics')
			.html(jade.render('statistics', { quiz: this, stuff: stuff }))
			.slideDown()
			.animateBar();
	},

	toggleHeatMap: function() {
		this.quizElem.toggleClass('heatmap');
		var show = this.quizElem.hasClass('heatmap');
		this.quizElem.find('.show-heatmap').html(this.quizElem.find('.show-heatmap').attr(show ? 'data-alter' : 'data-label'));
		if (show) {
			var max = this.stats.famous[0].value;
			var min = this.stats.famous[this.stats.famous.length - 1].value;
			this.stats.famous.forEach(function (entry) {
				var color = stuff.colorInRange((entry.value - min) / (max - min),
								[
									stuff.hexToRgb('#D5453C'),
									stuff.hexToRgb('#E0DD2B'),
									stuff.hexToRgb('#3EC259')
								]
						);
				this.quizElem.find('.input[data-id=' + entry.id + ']')
					.css('background-color', 'rgba(' + color.join(',') + ',.7)')
					.attr('title', entry.value + ' % угадавших');
				if (this.hiddenInputs) {
					this.paintArea(this.entriesById[entry.id].area, 'rgb(' + color.join(',') + ')');
				}
			}, this);
			$.scrollTo(this.mapElem);
		} else {
			this.quizElem.find('.input').css('background-color', '').attr('title', '');
			this.paintArea(this.mapElem.find('.area'), ''); // clear all areas fill
		}
	},

	calculateResults: function(answers) {
		var results = {
			total: this.entries.length,
			correct: 0,
			answers: {},
			correctIds: []
		};
		// Iterate over the input values
		Object.keys(answers).forEach(function(id) {
			var answer = answers[id];
			var entry = this.entriesById[id];
			if (answer) {
				// Check correctness
				var correct = this.checkCorrect(id, answer);
				results.answers[id] = correct ? 'correct' : 'wrong';
				if (correct) {
					results.correct++;
					results.correctIds.push(id);
					return;
				}
				// Check semi-correctness
				var semi = this.iterate(function(iterEntry) {
					if (this.checkCorrect(iterEntry.id, answer)) {
						return this.checkSemiCorrect(iterEntry, entry);
					}
				});
				if (semi) {
					results.answers[id] = semi;
				}
			} else {
				results.answers[id] = '';
			}
		}, this);
		results.percent = (results.correct / results.total) * 100;
		return results;
	},

	renderResults: function() {
		var results = this.results;
		results.status = '';
		results.spent = new Date - this.started;
		if (this.shownSpent) {
			results.spent += this.shownSpent;
		}
		results.spentString = stuff.intervalString(this.results.spent);
		results.quiz = this;
		results.shareImage = 'http://mquiz.ru/' + this.name + '/shareimage?' + results.correctIds.join('&');
		var url = 'http://mquiz.ru/' + this.name;
		var img = results.shareImage;
		var fbImg = img + '&_type=fb';
		var vkImg = img + '&_type=vk';
		var acc = this.titleAcc || this.title;
		var gen = this.titleGen || acc;
		var title = 'Я знаю ' + acc +' на ' + Math.round(results.percent) + '%. А вы?';
		var description = this.subtitle || 'Проверьте свое знание ' + gen + '.';
		var fbUrl = url + '?' + $.param({ image: fbImg, title: title });
		results.share = {
			vk: 'http://vk.com/share.php?' + $.param({ url: url, image: vkImg, title: title, description: description }),
			fb: 'https://www.facebook.com/sharer/sharer.php?' + $.param({ s: 100, p: { url: fbUrl, title: title, summary: description, images: [img] }}),
			twitter: 'https://twitter.com/intent/tweet?' + $.param({ url: url, text: title }),
			lj: 'http://www.livejournal.com/update.bml?' + $.param({ subject: title, event: '<a href="' + url + '"><img src="' + img + '"></a><br><a href="' + url + '">Проверьте</a> свое знание ' + gen + '.' })
		};
		if (this.stats.lessCount) {
			results.betterThan = Math.round(this.stats.lessCount[Math.round(results.percent)] / this.stats.games * 100);
		}
		// Find the outcome
		var i = this.outcomes.length - 1;
		while (this.outcomes[i][0] > results.percent) {
			i--;
		}
		results.outcome = this.outcomes[i];
		this.quizElem.find('.results').html(jade.render('results', results));
	},

	registerAttempt: function() {
		var self = this;
		// Send user attempt to the server
		var post = {
			answers: this.answers,
			spent: this.results.spent,
			maxPoints: this.entries.length,
			session: this.session,
			resumed: this.resumed
		};
		$.ajax({
			url: '/' + this.name + '/register',
			type: 'post',
			data: JSON.stringify(post),
			contentType : 'application/json'
		}).done(function(session) {
			self.session = self.session || session;
			// Save to local storage
			if (stuff.localStorage()) {
				var oldValue = localStorage.getItem('result.' + self.name) || -1;
				if (self.results.percent > oldValue) {
					// Don't save worse result
					localStorage.setItem('result.' + self.name, self.results.percent);
					localStorage.setItem('result.' + self.name + '.session', self.session);
				}
			}
		});
	}
};
