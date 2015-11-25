module.exports = {
	title: 'Омское метро',
	titleGen: 'Омского метро',
	subtitle: 'Настоящий ли вы Омич?',
	mixins: ['metro'],
	vectorMap: 'map.svg',
	entries: [
		{ id: 0, line: 1, name: 'Библиотека имени Пушкина'}
	],
	lineColors: {  1: '#ee2f29' },
	inputShiftY: -35,
	color: '#fede58',
	foreColor: 'black',
	inputAlign: 'center',
	width: 800,
	height: 640,
	outcomes: [
		[0, 'Вы — не настоящий Омич'],
		[100, 'Вы — настоящий Омич']
	],
	countEmptyGames: true
};
