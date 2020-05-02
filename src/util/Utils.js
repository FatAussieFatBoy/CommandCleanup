'use strict';

exports.escapeRegex = function(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

exports.paginate = function(items, page = 1, pageLength = 10) {
    const maxPage = Math.ceil(items.length / pageLength);
    if (page < 1) page = maxPage;
    if (page > maxPage) page = 0;

    const startIndex = (page - 1) * pageLength;

    return {
        items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
        page,
        maxPage,
        pageLength
    };
}

/**
 * Construct a timestamp.
 * @typedef {Object} TimestampOptions
 * 
 * @property {Number|Date} duration
 * @property {String} method
 * 
 * @property {String} [selector]
 * 
 * valid selector options,
 * * Days: d, days, day
 * * Hours: h, hours, hour, hrs, hr
 * * Minutes: m, minutes, minute, mins, min
 * * Seconds: s, seconds, second, secs, sec
 * 
 * if no selector is provided, then the selector will default to seconds.
 */

/**
 * @param {TimestampOptions} options
 * @return {Number}
 */

exports.createTimestamp = (options) => {
    if (!options.duration || (Number.isNaN(options.duration) && !options.duration instanceof Date)) throw new TypeError('The "duration" option must be a number or date.');
    if (options.selector && typeof options.selector !== 'string') throw new TypeError('The "selector" option must be a string.');
    else if (!options.selector) options['selector'] = 'seconds';

    const accumulate = (operator, ...operands) => operands.reduce((p, n) => eval(`p ${operator} n`), 0);

    switch(options.selector) {
        case 'd':
        case 'day':
        case 'days':
            return accumulate(method, new Date().getTime(), (options.duration * 24 * 60 * 60 * 1000));
            // days * hours/day * minutes/hour * seconds/minute * milliseconds/second

        case 'h':
        case 'hr':
        case 'hrs':
        case 'hour':
        case 'hours':
            return accumulate(method, new Date().getTime(), (options.duration * 60 * 60 * 1000));
            // hours * minutes/hour * seconds/minute * milliseconds/second

        case 'm':
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
            return accumulate(method, new Date().getTime(), (options.duration * 60 * 1000));
            // minutes * seconds/minute * milliseconds/second

        case 's':
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
            return accumulate(method, new Date().getTime(), (options.duration * 1000));
            // seconds * milliseconds/second

        default: throw new TypeError(`"${options.selector}" is not a valid date selector.`);
    }
};