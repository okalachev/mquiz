module.exports = {
	title: 'таблица Менделеева',
	titleAcc: 'таблицу Менделеева',
	titleGen: 'таблицы Менделеева',
	subtitle: 'Вспомните названия химических элементов соответсвенно их символам.',
	inputAlign: 'center',
	inputShiftY: 20,
	inputStyle: {
		'min-width': 50,
		'max-width': 50,
		overflow: 'hidden',
		'text-overflow': 'ellipsis',
		'font-size': 10,
		padding: 0,
		'text-align': 'center'
	},
	entries: require('./entries'),
	entryName: {
		1: 'элемент таблицы Менделеева',
		2: 'элемента таблицы Менделеева',
		5: 'элементов таблицы Менделеева',
		plural: 'элементы таблицы Менделеева'
	},
	color: '#ed9bcb',
	width: 1000,
	height: 546
};
