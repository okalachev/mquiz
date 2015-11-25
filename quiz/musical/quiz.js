module.exports = {
	title: 'музыкальная нотация',
	titleAcc: 'музыкальную нотацию',
	titleGen: 'музыкальной нотации',
	subtitle: 'Хорошо ли вы читаете современную музыкальную нотацию?',
	inputAlign: 'center',
	color: '#009983',
	entryName: { 1: 'обозначение', 2: 'обозначения', 5: 'обозначений' },
	width: 1000,
	height: 890,
	entries: [
		{id:0,name:'Темп',shiftY:-60},

		{id:1,name:'Скрипичный ключ'},
		{id:2,name:'Четыре четверти',alter:['4/4'],alignTo:6},
		{id:4,name:'Басовый ключ',alignTo:6},
		{id:5,name:'Алла бреве',alter:['Две вторых','Две половинных','2/2'],alignTo:6},
		{id:6,name:'Альтовый ключ'},
		{id:8,name:'Реприза',alter:['Знак репризы'],alignTo:6},
		{id:7,name:'Нейтральный ключ',alignTo:6},

		{id:12,name:'Бемоль'},
		{id:24,name:'Четвертная пауза',alignTo:12},
		{id:11,name:'Диез',alignTo:12},
		{id:39,name:'Глиссандо',alter:['Портаменто'],alignTo:12},
		{id:13,name:'Дубль-бемоль',alter:['Дубль бемоль'],alignTo:12},
		{id:22,name:'Половинная пауза',alignTo:12},
		{id:14,name:'Дубль-диез',alter:['Дубль диез'],alignTo:12},

		{id:44,name:'Меццо-Форте',alter:['Меццо Форте']},
		{id:34,name:'Нажать педаль',alter:['Педаль'],alignTo:44},
		{id:35,name:'Снять педаль',alter:['Отпустить педаль'],alignTo:44},
		{id:45,name:'Пианиссимо',alignTo:44},

		{id:20,name:'Шестнадцатая пауза',alignTo:10},
		{id:10,name:'Бекар'},
		{id:26,name:'Целая пауза',alignTo:10},
		{id:21,name:'Фермата',alignTo:10},
		{id:29,name:'Восьмая пауза',alignTo:10},
		{id:25,name:'Стаккато',alignTo:10},
		{id:27,name:'Бревис',alter:['Двойная пауза'],alignTo:10},
		{id:40,name:'Тремоло',alignTo:10},

		{id:15,name:'Пиано',alignTo:17},
		{id:16,name:'Крещендо',alignTo:17},
		{id:17,name:'Форте'},
		{id:18,name:'Диминуэндо',alignTo:17},
		{id:19,name:'Меццо-Пиано',alter:['Меццо Пиано'],alignTo:17},

		{id:36,name:'Акцент',alignTo:32},
		{id:31,name:'Люфтпауза',alter:['Люфт-пауза','Вдох'],alignTo:32},
		{id:28,name:'Трель',alignTo:32},
		{id:37,name:'Триоль',alignTo:32},
		{id:30,name:'Стаккатиссимо',alter:['Спиккато'],alignTo:32},
		{id:33,name:'Цезура',alignTo:32},
		{id:32,name:'Форшлаг'},

		{id:46,name:'Сфорцандо'},
		{id:47,name:'Фортиссимо'},

		{id:38,name:'Тенуто',alter:['Тэнуто'],alignTo:43},
		{id:43,name:'Легато',alter:['Лига фразировочная','Фразировочная лига']},
		{id:3,name:'Тактовая черта',alignTo:43},
		{id:42,name:'Группетто',alignTo:43},
		{id:9,name:'Двойная тактовая черта',alignTo:43},
		{id:41,name:'Лига',alter:['Лига связующая','Связующая лига'],alignTo:43},
		{id:23,name:'Вибрато',alignTo:43}
	],

	getInputPosition: function(entry) {
		return {
			x: entry.areaRect.centerLeft,
			y: entry.alignTo ?
				this.getInputPosition(this.entriesById[entry.alignTo]).y :
				entry.areaRect.bottom + 15
		}
	}
};
