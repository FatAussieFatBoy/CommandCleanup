const chalk = require('chalk');
const util = require('util');

module.exports = {
    /**
     * The current date formatted into a readable string.
     * @type {String}
     */

    date: () => { 
        let formatter = new Intl.DateTimeFormat('default', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        });

        let date = new Date();
        let parts = formatter.formatToParts(date);
        parts.push({ type: 'literal', value: '.' }, { type: 'milliseconds', value: date.getMilliseconds().toString().slice(0,2) });
        let formatted = parts.map(({ type, value }) => { return value; }).reduce((string, part) => string + part);
        return formatted;
    },

    /**
     * Log a console message as the shard
     * @param {Shard} shard
     * @param {*} content
     */

    log: function(shard, content) {
        _send({ shard: shard.id, type: 'log', message: content });
    },
    
    /**
     * Send a debug console message as the shard
     * @param {Shard} shard
     * @param {*} content
     */

    debug: function(shard, content) {
        _send({ shard: shard.id, type: 'debug', message: content });
    },

    /**
     * Send a warning console message as the shard
     * @param {Shard} shard
     * @param {*} content
     */

    warn: function(shard, content) {
        _send({ shard: shard.id, type: 'warn', message: content });
    },

    /**
     * Send a error console message as the shard
     * @param {Shard} shard
     * @param {*} content
     */

    error: function(shard, content) {
        _send({ shard: shard.id, type: 'error', message: content });
    }
}

/**
 * @typedef {Object} sendData
 * @property {Shard|Number} [shard] @defaults "*"
 * @property {String} [type] @defaults ""
 * @property {*} message
 */

/**
 * Send a console message
 * @param {sendData} data
 * @private
 */

function _send(data) {
    //console.log(data);

    if (data['shard'] == null || data['shard'] == undefined) data.shard = '*';
    if (data['type'] == null || data['type'] == undefined) data.type = '';
    if (data['message']) data.message = util.inspect(data.message, true, 2, true);

    if (data['type'] && typeof data.type !== 'string') throw new TypeError('The "type" of data must be a string.');
    switch(data.type) {
        case 'log':
            console.log('[%s] %s : %s', chalk.bold(data.shard.id||data.shard), chalk.inverse(module.exports.date()), data.message);
            break;

        case 'debug':
            console.debug('[%s] %s : %s', chalk.bold(data.shard.id||data.shard), chalk.black.bgGreen(module.exports.date()), chalk.green(data.message));
            break;

        case 'warn':
            console.warn('[%s] %s : %s', chalk.bold(data.shard.id||data.shard), chalk.black.bgYellow(module.exports.date()), chalk.yellow(data.message));
            break;

        case 'error':
            console.error('[%s] %s : %s', chalk.bold(data.shard.id||data.shard), chalk.black.bgRed(module.exports.date()), chalk.red(data.message));
            break;

        default:
            console.log('[%s] %s : %s', chalk.bold(data.shard.id||data.shard), chalk.inverse(module.exports.date()), chalk.grey(data.message));
    }
}