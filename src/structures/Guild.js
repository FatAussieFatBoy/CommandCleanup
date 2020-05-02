'use strict';

const { Structures } = require('discord.js');
const GuildDatabaseHelper = require('../client/rest/GuildHelper');

module.exports = Structures.extend('Guild', Guild => {
    class CleanupGuild extends Guild {
        constructor(...args) {
            super(...args);
        }
    }

    return CleanupGuild;
});