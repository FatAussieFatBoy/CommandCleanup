const { Command } = require('discord.js-commando');

class CleanupCommand extends Command {
    constructor(...args) {
        super(...args);
    }

    /**
     * Overwrite the onError method.
     * @param {Error} err 
     * @param {CommandMessage} message 
     * @param {Object|String|Array<String>} args 
     * @param {Boolean} fromPattern 
     * @param {?ArgumentCollectorResult} result
     * @returns {Promise<?Message|?Array<Message>>}
     */

    onError(err, message, args, fromPattern, result) {
        const invite = this.client.options.invite;
		return message.direct('', { embed: {
            title: `**Oops!** <a:deny_gif:567114319024619530>`,
            color: 'ff0000',
			description: `It appears an error has occured with the bot, this is not to any fault of yours.. But we do ask you please join our ${invite ? `[Support Server](${invite})` : 'Support Server'} and notify us of this problem.`,
			fields: [
                { name: 'Error Identifier', value: `\`${message.id}\``, inline: false },
                { name: 'Error Response', value: `\`\`\`js\n${err.name}: ${err.message}\n\`\`\``, inline: false}
            ],
            footer: {
                text: new Date(Date.now()).toLocaleString()
            }
        } }).then(m => m.delete({ timeout: 60000, reason: 'Automated Deletion.' }));
    }

}

module.exports = CleanupCommand;