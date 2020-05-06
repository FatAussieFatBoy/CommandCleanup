const BaseCommand = require('./base');
const { MessageEmbed } = require('discord.js');
const { errorEmbed } = require('../../util/Utils');

class HelpCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'general',
            memberName: 'help',
            aliases: ['h'],
            description: 'Displays a list of avaiable commands, or detailed information for a specified command.',
            details: 'The command may be part of a command name or a whole command name. If it isn\'t specified, all avaiable commands will be listed.',
            examples: ['help prefix'],
            guarded: true,

            args: [
                {
                    key: 'command',
                    prompt: 'Which command would you like to view the help for?',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, args) {
        const groups = this.client.registry.groups;
        const commands = this.client.registry.findCommands(args.command, false, msg);

        if (args.command) {
            if (commands.length == 1) {
                const messages = [];
                try {
                    let embed = new MessageEmbed({ description: `Here are some usage examples, aliases and description for the command **\`${commands[0].name}\`**.\nUsage legend: *<optional>* | *(required)*` });
                    embed.addField('Usage:', `**${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}${commands[0].name} ${commands[0].argsCollector ? commands[0].argsCollector.args.map(a => a.default !== null ? `<${a.key}>` : `(${a.key})`).join(' ') : commands[0].format ? commands[0].format : ''}**\n`, true);
                    if (commands[0].examples) embed.addField('Examples:', commands[0].examples.splice(0, 3).map(e => `**${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}${e}**`).join(', '), true);
                    if (commands[0].aliases) embed.addField('Aliases:', commands[0].aliases.map(a => `**${a}**`).join(', '), true);
                    embed.addField('Description:', commands[0].description);
                    if (commands[0].details) embed.addField('Details:', commands[0].details);
                    messages.push(await msg.direct('', embed)) //successfully sent help, notify them in the guild.
                } catch (err) {
                    this.client.emit('error', err);
                    messages.push(msg.channel.send(msg.channel.send('', errorEmbed(`The help documentation couldn\'t be sent to ${msg.author}, please make sure they allow "messages from server members" in the user privacy settings.`)).then(m => m.delete({ timeout: 20000, reason: 'Automated deletion.' }))));
                }

                return messages;
            } else if (commands.length > 9) {
                // too many matches, ask for specification
            } else if (commands.length > 1) {
                // list all available commands that match
            } else {
                if (msg.channel.type == 'dm') return await msg.direct('', errorEmbed(`Can't fetch help documentation for \`${args.command}\`, please double check the spelling.`)).then(m => m.delete({ timeout: 10000, reason: 'Automated deletion.' }));
            }
        } else {
            const messages = [];
            try {
                let embed  = new MessageEmbed({ description: `Here is a list of commands and their respective categories.\nIf you'd like more details about a command you can use ${this.usage('<command>', msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix, null)}.\n\nHere is also a list of useful links that might also be of some assistance:\n• [Support Server](${this.client.options.invite||'https://discord.gg/Gkdbyeh'}) • [DiscordBots Page](https://discordbots.org/bot/420013638468894731) • [Patreon](https://www.patreon.com/fataussie)\n\nAvailable commands in **${msg.guild || 'this DM'}**` });
                groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && cmd.isUsable(msg)))
                    .map(grp => {
                        let cmds = grp.commands.filter(cmd => !cmd.hidden && cmd.isUsable(msg)).map(cmd => `**${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}${cmd.name}**\n${cmd.description}${cmd.nsfw ? '\n*\`NSFW\`*' : ''}`).join('\n\n');
                        embed.addField(grp.name, cmds);
                    });
                messages.push(await msg.direct('', embed));
                if (msg.channel.type !== 'dm') messages.push(msg.channel.send('', { embed: { color: '00ff00', title: `**Success!** <:approve:567107353028329472>`, description: `Sent help documentation to ${msg.author}`} }).then(m => m.delete({ timeout: 5000, reason: 'Automated deletion.' }))) //successfully sent help, notify them in the guild.
            } catch (err) {
                this.client.emit('error', err);
                messages.push(msg.channel.send('', errorEmbed(`The help documentation couldn\'t be sent to ${msg.author}, please make sure they allow "messages from server members" in the user privacy settings.`)).then(m => m.delete({ timeout: 20000, reason: 'Automated deletion.' })));
            }

            return messages;
        }
    }    
}

module.exports = HelpCommand;