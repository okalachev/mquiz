module.exports = {
	mixins: ['metro'],
	alias: 'spb',
	title: 'Питерское метро',
	titleGen: 'Питерского метро',
	subtitle: 'Какой вы знаток Питерского метро?',
	color: '#1e3c74',
	vectorMap: 'map.svg',
	width: 1000,
	height: 812,
	inputShiftX: 15,
	entries: require('./entries.json'),
	inputStyle: {
		padding: 1
	},

	lineColors: {
		1: '#d609m3b',
		2: '#0078ca',
		3: '#009a4a',
		4: '#eb7225',
		5: '#712785'
	},

	getArea: function(id) {
		return this.svgContext.find('#e' + id + ', #e' + id + '_1_');
	}

};
