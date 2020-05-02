const { CommandoClient } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

class CleanupClient extends CommandoClient {
    constructor(options = {}) {
        super(options);

        /** Register Commands */

        this.registry.registerGroups([
            ['general', 'General Commands'],
            ['moderation', 'Moderation Commands'],
            ['system', 'System Commands']
        ])
        .registerDefaultTypes()
        .registerCommand(require('./commands/unknown'))
        .registerCommand(require('./commands/invite'))
        .registerCommand(require('./commands/help'))
        .registerCommand(require('./commands/stats'))
        .registerCommand(require('./commands/cleanup'))
        
        /** Error handling */

        /**
         * The clients error log channel
         * @type {?Snowflake|Channel}
         */

        this.errorLogChannel = options.errorLogChannel || null;

        this.on('commandError', (command, err, message) => {
            try {
                let errorEmbed = this._constructErrorEmbed(err, command, message);
                this.channels.fetch(this.errorLogChannel).then(channel => channel.send('', errorEmbed));
                return;
            } catch (e) {
                this.emit('error', e);
            }
        });
    }

    _constructErrorEmbed(err, command, message) {
        let errorEmbed = new MessageEmbed({ title: `**Error occured:** ${this.user.username}`, color: 'ff0000', description: `\`\`\`js\n${err.stack}\n\`\`\``, footer: { text: new Date(Date.now()).toLocaleString() } });
        
        if (message) {
            errorEmbed.addField('Author', `${message.author.username.replace(/([`'"])/g, "\\$1")}\n\`(${message.author.id})\``, true);
            if (message.guild) errorEmbed.addField('Guild', `${message.guild.name.replace(/([`'"])/g, '')}\n\`(${message.guild.id})\``, true);
            errorEmbed.addField('Channel', `${message.channel.name.replace(/([`'"])/g, "\\$1")}\n\`(${message.channel.id})\``, true);
            errorEmbed.addField('Message', `${message.cleanContent}\n\`(${message.id})\``, true);
        }

        if (command) errorEmbed.addField('Command', `\`${command.group.id}:${command.memberName}\``, true);
        if (this.shard) errorEmbed.addField('Shards', `\`${this.shard.ids.join(', ')}\``, true);
        return errorEmbed;
    }
}

module.exports = CleanupClient;