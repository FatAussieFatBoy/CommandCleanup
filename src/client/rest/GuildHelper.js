class GuildHelper {
    constructor(guild) {

        /**
         * The helpers client
         * @type {CleanupClient}
         * @readonly
         */

        Object.defineProperty(this, 'client', { value: guild.client, writable: false });

        /**
         * The helpers guild
         * @type {CleanupGuild}
         */

        this.guild = guild;

    }
}

module.exports = GuildHelper;