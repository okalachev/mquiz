module.exports = {
	alias: 'msk',
	title: 'Московское метро',
	titleGen: 'Московского метро',
	added: new Date('2013-11-17'),
	subtitle: 'Проверьте, насколько хорошо вы знаете Московское метро.',
	mixins: ['metro'],
	color: '#A6072F',
	logo: 'logo.svg',
	vectorMap: false,
	width: 1000,
	height: 1222,
	entries: require('./entries'),
	inputShiftX: 0,
	inputShiftY: -2,
	inputStyle: {
		padding: 0,
		'font-size': '13px',
		width: '80px',
		'min-width': '80px'
	},
	keywords: ['метро', 'москва', 'московское метро', 'станции', 'схема'],
	lineColors: {
		1: '#ef2e24',
		2: '#46b85e',
		3: '#0079bf',
		4: '#1ac2f3',
		5: '#894e35',
		6: '#f68232',
		7: '#8e479d',
		8: '#ffcb31',
		9: '#a2a3a4',
		10: '#b3d545',
		11: '#79ccce',
		12: '#abc0e2'
	},
	outcomes: [
		[0, 'Вы лимита', 'вы еще не поселились в Москве.'],
		[5, 'У вас большой простор для открытий', 'вы редко ездите на метро дальше двух остановок.'],
		[10, 'Офисный работник', 'вы хорошо знаете маршрут от дома до работы.'],
		[20, 'Средний результат', 'вы знаете лишь небольшую часть станций Московского метро.'],
		[30, 'Неплохо', 'вы не понаслышке знаете Московское метро.'],
		[40, 'Хорошо', 'вы знаете почти половину станций Московского метро.'],
		[50, 'Очень хорошо', 'вы знаете больше половины станций Московского метро.'],
		[60, 'Здорово', 'вы хорошо знаете большую часть станций Московского метро.'],
		[85, 'Великолепно', 'вы отлично знаете Московское метро.'],
		[98, 'Браво', 'вы настоящий знаток Московского метро.'],
		[100, 'Составитель схемы', 'вы, часом, не читер?']
	]
};
