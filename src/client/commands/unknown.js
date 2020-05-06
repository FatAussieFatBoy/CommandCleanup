const BaseCommand = require('./base');
const { errorEmbed } = require('../../util/Utils');

class UnknownCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'unknown',
            group: 'system',
            memberName: 'unknown',
            description: 'Displays help information for when an unknown command is used.',
            examples: ['unknown blahblah'],
            unknown: true,
            hidden: true
        });
    }

    async run(msg) {
        if (msg.channel.type == 'dm') return msg.direct('', errorEmbed({ title: 'Unrecognised Command', description: `The command \`${msg.cleanContent}\` couldn't be recognised, please use ${msg.anyUsage('help', msg.guild ? msg.commandPrefix : this.client.commandPrefix, null)} for a list of available commands.` }));
        else return null;
    }

}

module.exports = UnknownCommand;