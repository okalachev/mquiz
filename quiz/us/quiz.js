module.exports = {
	title: 'штаты США',
	titleGen: 'штатов США',
	mixins: ['map'],
	width: 800,
	height: 506,
	entries: [
		{"id": 8, "name": "Вашингтон", "eng": "Washington", "code": "WA"},
		{"id": 1, "name": "Айдахо", "eng": "Idaho", "code": "ID"},
		{"id": 29, "name": "Монтана", "eng": "Montana", "code": "MT"},
		{"id": 43, "name": "Северная Дакота", "eng": "NorthDakota", "code": "ND"},
		{"id": 25, "name": "Миннесота", "eng": "Minnesota", "code": "MN"},
		{"id": 11, "name": "Висконсин", "eng": "Wisconsin", "code": "WI", shiftY: 20},
		{"id": 28, "name": "Мичиган", "eng": "Michigan", "code": "MI"},
		{"id": 36, "name": "Нью-Йорк", alter: ['Нью Йорк'], "eng": "NewYork", "code": "NY", shiftX: -40},
		{"id": 30, "name": "Мэн", "eng": "Maine", "code": "ME", shiftY: -30},
		{"id": 34, "name": "Нью-Гэмпшир", alter: ['Нью Гемпшир', 'Нью-Гемпшир', 'Нью Гэмпшир'], "eng": "NewHampshire", "code": "NH", shiftY: -30},
		{"id": 9, "name": "Вермонт", "eng": "Vermont", "code": "VT", shiftY: -10},
		{"id": 24, "name": "Массачусетс", "eng": "Massachusetts", "code": "MA", shiftY: -15},
		{"id": 42, "name": "Род-Айленд", alter: ['Род Айленд'], "eng": "RhodeIsland", "code": "RI", shiftY: -5},
		{"id": 22, "name": "Коннектикут", "eng": "Connecticut", "code": "CT", shiftY: 5},
		{"id": 35, "name": "Нью-Джерси", alter: ['Нью Джерси'], "eng": "NewJersey", "code": "NJ", shiftY: -10, shiftX: 10},
		{"id": 40, "name": "Орегон", "eng": "Oregon", "code": "OR", shiftY: 20},
		{"id": 7, "name": "Вайоминг", "eng": "Wyoming", "code": "WY"},
		{"id": 48, "name": "Южная Дакота", "eng": "SouthDakota", "code": "SD"},
		{"id": 32, "name": "Небраска", "eng": "Nebraska", "code": "NE"},
		{"id": 2, "name": "Айова", "eng": "Iowa", "code": "IA"},
		{"id": 16, "name": "Иллинойс", "eng": "Illinois", "code": "IL", shiftX: -20},
		{"id": 17, "name": "Индиана", "eng": "Indiana", "code": "IN"},
		{"id": 38, "name": "Огайо", "eng": "Ohio", "code": "OH"},
		{"id": 41, "name": "Пенсильвания", "eng": "Pennsylvania", "code": "PA", shiftY: -15, shiftX: -30},
		{"id": 13, "name": "Делавэр", "eng": "Delaware", "code": "DE", shiftY: -10},
		{"id": 15, "name": "Западная Виргиния", "eng": "WestVirginia", "code": "WV", shiftY: 10},
		{"id": 31, "name": "Мэриленд", "eng": "Maryland", "code": "MD"},
		{"id": 18, "name": "Калифорния", "eng": "California", "code": "CA"},
		{"id": 33, "name": "Невада", "eng": "Nevada", "code": "NV", shiftY: -20},
		{"id": 50, "name": "Юта", "eng": "Utah", "code": "UT", shiftY: 10},
		{"id": 21, "name": "Колорадо", "eng": "Colorado", "code": "CO"},
		{"id": 19, "name": "Канзас", "eng": "Kansas", "code": "KS"},
		{"id": 27, "name": "Миссури", "eng": "Missouri", "code": "MO"},
		{"id": 20, "name": "Кентукки", "eng": "Kentucky", "code": "KY"},
		{"id": 10, "name": "Виргиния", "eng": "Virginia", "code": "VA", shiftY: 15},
		{"id": 5, "name": "Аризона", "eng": "Arizona", "code": "AZ"},
		{"id": 37, "name": "Нью-Мексико", alter: ['Нью Мексико'], "eng": "NewMexico", "code": "NM"},
		{"id": 39, "name": "Оклахома", "eng": "Oklahoma", "code": "OK"},
		{"id": 6, "name": "Арканзас", "eng": "Arkansas", "code": "AR"},
		{"id": 45, "name": "Теннесси", "eng": "Tennessee", "code": "TN"},
		{"id": 44, "name": "Северная Каролина", "eng": "NorthCarolina", "code": "NC"},
		{"id": 26, "name": "Миссисипи", "eng": "Mississippi", "code": "MS"},
		{"id": 3, "name": "Алабама", "eng": "Alabama", "code": "AL", shiftY: -20, shiftX: -20},
		{"id": 14, "name": "Джорджия", "eng": "Georgia", "code": "GA", shiftX: 20},
		{"id": 49, "name": "Южная Каролина", "eng": "SouthCarolina", "code": "SC", shiftX: 20, shiftY: -10},
		{"id": 46, "name": "Техас", "eng": "Texas", "code": "TX"},
		{"id": 23, "name": "Луизиана", "eng": "Louisiana", "code": "LA"},
		{"id": 47, "name": "Флорида", "eng": "Florida", "code": "FL"},
		{"id": 4, "name": "Аляска", "eng": "Alaska", "code": "AK"},
		{"id": 12, "name": "Гавайи", "eng": "Hawaii", "code": "HI"}
	],
	color: '#063797',

	getArea: function(id) {
		return this.svgContext.find('#' + this.entriesById[id].eng).attr('id', '');
	}
};
