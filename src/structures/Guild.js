'use strict';

const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
    class CleanupGuild extends Guild {
        constructor(...args) {
            super(...args);
        }
    }

    return CleanupGuild;
});