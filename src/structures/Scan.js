'use strict';

const { Base } = require('discord.js');

class CleanupScan extends Base {
    constructor(channel, data) {
        super(channel.client);

        /**
         * The guild channel this scan reads
         * @type {TextChannel}
         */

        this.channel = channel;
    }

    _patch(data) {

    }
}

module.exports = CleanupScan;