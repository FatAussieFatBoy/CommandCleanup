const BaseCommand = require('./base');

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
        return null;
    }

}

module.exports = UnknownCommand;