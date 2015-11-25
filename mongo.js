var URI = process.env.MONGOLAB_URI || process.env.MONGO_URI || 'mongodb://localhost/metroquiz';

module.exports = require('monk')(URI, function(err) {
	if (err) console.error('mongodb error', err);
});
