'use strict';
const { RegularExpressions } = require('./Constants');
const { MessageEmbed } = require('discord.js');

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

exports.resolveDateString = (string) => {
    if (typeof string !== 'string') throw new TypeError('Invalid date "string" provided, must be of type string.');
    if (!RegularExpressions.date_string.test(string)) throw new TypeError('The provided "string" doesn\'t match a date strings format. Must be a number followed by a duration identified like \'days\'.');

    let duration_in_ms = 0;
    let matches = string.match(RegularExpressions.date_string);
    for (let m of matches) {
        
        let numerator = m.match(/\d+/g)[0];
        let selector = m.match(/[a-z]+/gi)[0];
        
        switch(selector.toLowerCase().trim()) {
            case 'd':
            case 'day':
            case 'days':
                duration_in_ms += (numerator * 24 * 60 * 60 * 1000);
                // days * hours/day * minutes/hour * seconds/minute * milliseconds/second   
                break;

            case 'h':
            case 'hr':
            case 'hrs':
            case 'hour':
            case 'hours':
                duration_in_ms += (numerator * 60 * 60 * 1000);
                // hours * minutes/hour * seconds/minute * milliseconds/second   
                break;

            case 'm':
            case 'min':
            case 'mins':
            case 'minute':
            case 'minutes':
                duration_in_ms += (numerator * 60 * 1000);
                // minutes * seconds/minute * milliseconds/second   
                break;

            case 's':
            case 'sec':
            case 'secs':
            case 'second':
            case 'seconds':
                duration_in_ms += (numerator  * 1000);
                // seconds * milliseconds/second   
                break;

            default: throw new TypeError(`${selector} is not a valid date identifier.`);
        }
    }
    
    return new Date(duration_in_ms);
};

/**
 * Construct a timestamp.
 * @typedef {String} DateString
 * 
 * Date strings consist of a numerical value, followed by a letter/work representing the duration.
 * Example: `1d`, `1day`, `1 day` = 1 day;
 */

/**
 * Construct a timestamp from a date or dateString
 * @param {String} method - The math method used to combine the durations.
 * @param {Date|DateString|Array<Date|DateString|>} durations - The durations to combine, the first provided duration is the one combined into
 * @return {Date}
 */

exports.createTimestamp = (...durations) => {
    let _duration = durations.reduce((duration, d) => {
        if (Array.isArray(duration)) duration = duration.reduce((p, n) => this.createTimestamp(p, n), 0);
        if (Array.isArray(d)) d = d.reduce((p, n) => this.createTimestamp(p, n), 0);

        if (typeof d == 'string') d = exports.resolveDateString(d);
        if (typeof d === 'date' || d instanceof Date || !Number.isNaN(d)) {
            if (new Date(duration) > new Date(d)) return new Date(duration).getTime() + new Date(d).getTime();
            else return new Date(duration).getTime() - new Date(d).getTime();
        } else {
            return new Date(duration).getTime();
        }
    });

    //console.log(_duration);
    return new Date(_duration);
};

/**
 * Construct a error embed and return it
 * @param {String|MessageEmbed|Object} [message] @default {}
 */

exports.errorEmbed = (message = {}) => {
    if (typeof message == 'string') return new MessageEmbed({ color: 'ff0000', title: '**Oops!** <a:deny_gif:567114319024619530>', description: message });
    else if (message instanceof MessageEmbed) {
        message.setColor('ff0000');
        if (!message.title) message.setTitle('**Oops!** <a:deny_gif:567114319024619530>');
        return message;
    }
    else if (message instanceof Object) {
        let embed = new MessageEmbed(message);
        embed.setColor('ff0000');
        if (!embed.title) embed.setTitle('**Oops!** <a:deny_gif:567114319024619530>');
        return embed;
    }
    else throw new TypeError('Invalid embed data provided.');
};