const BaseCommand = require('./base');

class InviteCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'invite',
            group: 'general',
            memberName: 'invite',
            aliases: ['inv'],
            description: `Get an invite link for the bot, so it can join your server.`,
            details: 'Generates an invite link with only the minimum bot required permissions.\n*(no more robot overlords)*',
            guarded: true
        });
    }

    run(msg) {
        this.client.generateInvite(['SEND_MESSAGES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'VIEW_AUDIT_LOG']).then((link) => {
            return msg.direct(`Hi there, thanks for considering to add **${this.client.user.username}** to your discord server!\nHere is an invite link, **NO LINK SINCE THIS IS A TESTING BOT**`)
        });
    }
}

module.exports = InviteCommand;