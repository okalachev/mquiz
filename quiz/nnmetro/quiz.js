module.exports = {
	alias: 'nn',
	title: 'Нижегородское метро',
	titleGen: 'Нижегородского метро',
	subtitle: 'Насколько хорошо вы знаете Нижегородское метро?',
	mixins: ['metro'],
	color: '#1065c5',
	width: 800,
	height: 788,
	entries: [
		{line:1,id:0,name:'Сенная'},
		{line:1,id:1,name:'Оперный театр',shiftY:-25,shiftX:-10},
		{line:1,id:2,name:'Горьковская',shiftY:-25,shiftX:-10},
		{line:1,id:3,name:'Московская',align:'right'},
		{line:1,id:4,name:'Чкаловская'},
		{line:1,id:5,name:'Ленинская'},
		{line:1,id:6,name:'Заречная'},
		{line:1,id:7,name:'Двигатель Революции'},
		{line:1,id:8,name:'Пролетарская'},
		{line:1,id:9,name:'Автозаводская'},
		{line:1,id:10,name:'Комсомольская'},
		{line:1,id:11,name:'Кировская'},
		{line:1,id:12,name:'Парк культуры'},

		{line:2,id:13,name:'Волга',align:'right'},
		{line:2,id:14,name:'Стрелка',shiftY:-25,shiftX:-10},
		{line:2,id:15,name:'Канавинская',shiftY:25,shiftX:-10,align:'right'},
		{line:2,id:16,name:'Бурнаковская',shiftY:25,shiftX:-10,align:'right'},
		{line:2,id:17,name:'Буревестник',shiftY:-25,shiftX:-10}
	],
	lineColors: {1: '#f02331', 2: '#237cad'},
	inputShiftX: 15
};
