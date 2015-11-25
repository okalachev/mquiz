module.exports = {
	title: 'Новосибирское метро',
	titleGen: 'Новосибирского метро',
	subtitle: 'Насколько хорошо вы знаете Новосибирское метро?',
	mixins: ['metro'],
	width: 600,
	height: 627,
	entries: [
		{line:1,id:0,name:'Заельцовская'},
		{line:1,id:1,name:'Гагаринская'},
		{line:1,id:2,name:'Красный проспект',shiftY:-23},
		{line:1,id:3,name:'Площадь Ленина'},
		{line:1,id:4,name:'Октябрьская'},
		{line:1,id:5,name:'Речной вокзал'},
		{line:1,id:6,name:'Студенческая'},
		{line:1,id:7,name:'Площадь Маркса'},

		{line:2,id:8,name:'Площадь Гарина-Михайловского'},
		{line:2,id:9,name:'Сибирская',shiftY:-23,shiftX:-8,align:'right'},
		{line:2,id:10,name:'Маршала Покрышкина',shiftY:23,shiftX:-8},
		{line:2,id:11,name:'Берёзовая роща',shiftY:-23,shiftX:-8},
		{line:2,id:12,name:'Золотая Нива'}
	],
	lineColors: { 1: '#ee3127', 2: '#47b75e' },
	inputShiftX: 12
};
