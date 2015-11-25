// Redirects from the old site

module.exports = function(req, res, next) {
	var NEW_URL = 'http://mquiz.ru';
	var queryString = '';
	if (req.originalUrl.indexOf('?') !== -1) {
		queryString = '?' + req.originalUrl.split('?').pop();
	}
	if (req.hostname == 'metroquiz.ru' || req.hostname == 'www.metroquiz.ru') {
		if (req.path == '/') {
			return res.redirect(NEW_URL + '/mskmetro' + queryString);
		} else if (req.path == '/result-image') {
			return res.redirect(NEW_URL + '/mskmetro/shareimage' + queryString);
		}
	}
	next();
};
