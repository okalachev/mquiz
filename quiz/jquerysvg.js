if (typeof window !== 'undefined') {
	$.fn.addClassSVG = function (className) {
		$(this).attr('class', function (index, existingClassNames) {
			return existingClassNames + ' ' + className;
		});
		return this;
	};

	/*
	 * .removeClassSVG(className)
	 * Removes the specified class to each of the set of matched SVG elements.
	 */
	$.fn.removeClassSVG = function (className) {
		$(this).attr('class', function (index, existingClassNames) {
			var re = new RegExp(className, 'g');
			return existingClassNames.replace(re, '');
		});
		return this;
	};

	$.fn.hasClassSVG = function(className) {
		return new RegExp('(\\s|^)' + className + '(\\s|$)').test($(this).attr('class'));
	};

	$.fn.toggleClassSVG = function(className, condition) {
		$(this)[condition ? 'addClassSVG': 'removeClassSVG'](className);
	}
}
