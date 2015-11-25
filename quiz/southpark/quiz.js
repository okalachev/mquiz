module.exports = {
	title: 'персонажи South Park',
	titleAcc: 'персонажей South Park',
	subtitle: 'Вспомните ли вы имена основных жителей Южного Парка?',
	rasterMap: 'map.jpg',
	mixins: ['character'],
	inputAlign: 'center',
	inputStyle: {
		'font-size': 12,
		'max-width': 120
	},
	color: '#219e49',
	entries: require('./entries'),
	correctColor: 'rgba(62, 195, 89, .2)',
	wrongColor: 'rgba(213,69,60,.2)',
	width: 1000,
	height: 982,
	minAutocompleteLength: 3,
	outcomes: [
		[0, 'Вы Кип Дрорди', 'у вас 0 друзей.'],
		[20, 'Плохо', 'продолжай, у тебя получится лучше.'],
		[40, 'Посредственно', 'вы иногда смотрите South Park.'],
		[50, 'Выше среднего', 'вы довольно часто смотрите South Park.'],
		[70, 'Хорошо', 'вы не понаслышке знаете South Park.'],
		[90, 'Отлично', 'вы настящий фанат South Park.'],
		[95, 'Житель South Park', 'Howdy neighbor!'],
		[100, 'South Park — ваш родной город', 'вы, часом, не читер?']
	],

	getArea: function(id) {
		return this.svgContext.find('#areas rect').eq(id - 1);
	},

	getInputPosition: function(entry) {
		return {
			x: entry.areaRect.centerLeft,
			y: entry.areaRect.bottom - 20
		};
	}

};
