'use strict';

const { BitField } = require('discord.js');

class Filter extends BitField {

    /**
	 * Data that can be resolved to give a filter number. This can be:
	 * * A string. (see { @link Filter.FLAGS })
	 * * A filter number.
	 * * An instance of Filter.
	 * * An array of any of the above.
	 * @typedef {string|number|Filter|FilterResolveable[]} FilterResolveable
	 */

	/**
	 * Check whether the bitfield has a filter, or any of multiple filters.
	 * @param {FilterResolveable} filter
	 * @returns {Boolean}
	 */

	any(filter) {
		return super.any(filter);
	}

	/**
	 * Checks whether the bitfield has a filter, or multiple filters.
	 * @param {FilterResolveable} filter
	 * @returns {Boolean}
	 */

	has(filter) {
		return super.has(filter);
	}

	/**
	 * Resolve
	 * @param {FilterResolveable} filter
	 * @return {Number}
	 */

	resolve(filter) {
		console.log(filter);
		return super.resolve(filter);
	}
}

/**
 * Numeric filter flags. All avilable properties:
 * * `PINNED` (is a pinned message)
 * * `SYSTEM` (is a system message)
 * * `PARTIAL` (is a partial message)
 * * `TTS` (is a text-to-speech message)
 * * `WEBHOOK` (is a message sent by webhook)
 * * `INVITE` (the message contains a discord invite url)
 * * `TEXT` (the message has no files or embeds)
 * * `EMBED` (the message contains an embed)
 * * `LINK` (the message contains a url)
 * * `COMMAND` (the message matches the command regex)
 * * `FILE` (the message contains an attachment other than an image)
 * * `IMAGE` (the message contains an image)
 * * `EMOJI` (the message contains at least one emoji)
 * * `DISCORD` (the message is a discord system message)
 * @type {Object}
 */

Filter.FLAGS = {
	PINNED: 1 << 0,
	SYSTEM: 1 << 1,
	PARTIAL: 1 << 2,
	TTS: 1 << 3,
	WEBHOOK: 1 << 4,

	INVITE: 1 << 5,
	TEXT: 1 << 6,
	EMBED: 1 << 7,
	LINK: 1 << 8,
	COMMAND: 1 << 9,
	FILE: 1 << 10,
	IMAGE: 1 << 11,
	EMOJI: 1 << 12,

	DISCORD: 1 << 13,
};

/**
 * Bitfield representing every filter combined
 * @type {Number}
 */

Filter.ALL = Object.values(Filter.FLAGS).reduce((all, p) => p !== Filter.FLAGS.PINNED ? all | p : all, 0);

module.exports = Filter;