exports.metro = {
	entryName: { 1: 'станция', 2: 'станции', 5: 'станций' },
	instruction: 'В этой игре вам нужно заполнить карту метро станциями. По памяти.',

	checkSemiCorrect: function(e1, e2) {
		return e1.line == e2.line ? 'line' : false;
	},

	getEntryIcon: function(id) {
		return '<span class="entry-icon" ' +
			'style="background-color: ' + this.lineColors[this.entriesById[id].line] + '"></span>';
	},

	shareImageSetAreaState: function(area, correct) {
		var color = correct ? this.correctColor : this.wrongColor;
		area.css('fill', color);
		var r = area.attr('r');
		if (r) {
			area.attr('r', r * 1.5);
		}
	}
};

exports.map = {
	hiddenInputs: true,
	inputAlign: 'center',
	inputStyle: {
		'text-align': 'center'
	}
};

exports.country = {
	entryName: { 1: 'страна', 2: 'страны', 5: 'стран' },
	instruction: 'В этой игре вам нужно отменить все страны на карте. По памяти.',

	getEntryIcon: function(id) {
		return '<span class="entry-icon" ' +
				'style="background-image: url(/static/flag/country/' + this.entriesById[id].code + '.svg)"></span>';
	}
};

exports.character = {
	entryTitleAcc: 'имени',
	entryName: { 1: 'персонаж', 2: 'персонажа', 3: 'персонажей', plural: 'персонажи' }
};

exports.list = {
	getHtml: function() {
		return require('jade').renderFile(__dirname + '/list.jade', { quiz: this });
	},

	getArea: function(id) {
		return this.mapElem.find('#' + id);
	}
};
