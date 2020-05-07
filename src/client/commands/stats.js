const BaseCommand = require('./base');
const { version, MessageEmbed } = require('discord.js');
const prettyms = require('pretty-ms');

class StatsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'system',
            memberName: 'stats',
            aliases: ['sts'],
            description: 'Displays information about the bot and server performance.',
            details: 'An embed with all information is displayed, however you can provide a valid shard id to get specific details.',
            ownerOnly: true,
            guarded: true,

            /** args: [
                {
                    key: 'shard',
                    prompt: 'Which shard would you like to see the details of?',
                    type: 'integer',
                    default: ''
                }
            ] */
        });
    }

    async run(msg, args) {
        if (args && args.shard) {
            //grab specific shard information
        } else {
            const messages = [];
            try {
                const guilds = await this.client.shard.fetchClientValues('guilds.cache.size').then((count) => count.reduce((p, n) => p + n, 0));
                const users = await this.client.shard.fetchClientValues('users.cache.size').then((count) => count.reduce((p, n) => p + n, 0));
                const channels = await this.client.shard.fetchClientValues('channels.cache.size').then((count) => count.reduce((p, n) => p + n, 0));

                let usedHeapSize, totalHeapSize;
                await this.client.shard.broadcastEval(`require('v8').getHeapStatistics()`).then((stats) => {
                    for (let stat of stats) {
                        usedHeapSize = parseInt(usedHeapSize + stat.used_heap_size) || stat.used_heap_size;
                        totalHeapSize = parseInt(totalHeapSize + stat.total_heap_size) || stat.total_heap_size;
                    }
                });

                const botInfo = [`**Shard Count:** \`${this.client.shard.count}\``, `**Memory Usage:** \`${(usedHeapSize / 1024 / 1024).toFixed(2)}/${(totalHeapSize / 1024 / 1024).toFixed(2)} MB\``, `**Uptime:** \`${prettyms(this.client.uptime)}\``, `**API Latency:**\n\`${Math.round(this.client.ws.ping)}ms.\``];
                const countInfo = [`**Server Count:** \`${guilds.toLocaleString()}\``, `**Loaded User Count:** \`${users.toLocaleString()}\``, `**Channel Count:** \`${channels.toLocaleString()}\``];
                const miscInfo = [`**Discord.js Version:** \`v${version}\``, `**Node Version:** \`${process.version}\``, `**Bot Version:** \`v${this.client.version}\``];
            
                const embed = new MessageEmbed()
                    .addField('Bot Information', botInfo.join(' '), false)
                    .addField('Count Information', countInfo.join('\n'), true)
                    .addField('Misc Information', miscInfo.join('\n'), true);

                messages.push(await msg.channel.send('', embed));
                return messages;
            } catch (e) {
                this.client.emit('error', e);
                messages.push(await msg.channel.send(`Error occured while grabbing bot stats\n\`\`\`${new Error(e).stack}\`\`\``));
                return messages;
            }
        }
    }
}

module.exports = StatsCommand;