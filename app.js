const { owner, admins, support, invite, prefix, errorLogChannel } = require('./config');
const Filters = require('./src/util/Filters');

/** Check node.js version is above 10 */
if (Number(process.version.slice(1).split('.')[0]) < 12) throw new Error('Node 12.0.0 or higher is required. Update Node on your system.');

const { Client, version } = require('./src/index');

const client = new Client({
    disableEveryone: true,
    messageCacheLifetime: 300,
	messageSweepInterval: 300,
    messageCacheMaxSize: 100,
    ws: {
        intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']
    },
    commandPrefix: prefix,
    owner: owner,
    commandEditableDuration: 0,
    invite: invite,
    errorLogChannel: errorLogChannel
});

const init = async function() {
    client.version = version;
    client.login(client.token);
}

client.on('debug', function(d) {
    client.shard.send({ type: 'debug', message: d });
});

client.on('warn', function(e) {
    client.shard.send({ type: 'warn', message: e });
});

client.on('error', function(e) {
    if (client.options.errorLogChannel) {
        let errorEmbed = client._constructErrorEmbed(e);
        client.channels.fetch(client.options.errorLogChannel).then(channel => { if(channel) channel.send('', errorEmbed) });
    }

    client.shard.send({ type: 'error', message: e.stack });
});

client.on('ready', function() {
    client.user.setActivity(`${client.commandPrefix}help & ${client.commandPrefix}invite`, { type: 'LISTENING' });
    client.emit('debug', `client ready and listening to; ${client.guilds.cache.size} guilds, ${client.channels.cache.filter(c => c.type === 'text').size} channels & ${client.users.cache.size} users.`);
});

client.on('guildCreate', function(guild) {
    client.emit('debug', `CommandCleanup successfully added to guild ${guild.id}`);
});

client.on('rateLimit', function(info) {
    client.emit('warn', info);
});

client.on('commandRun', (command, promise, message) => {
    if (command.unknown) return;
    if (promise && promise.then) {
        promise.then(() => {
            if (message.deletable) message.delete({ reason: 'Command Recognised' });
        });
    } else {
        if (message.deletable) message.delete({ reason: 'Command Recognised' });
    }
});

client.on('commandBlock', (message, reason, data) => {
    console.log(message, reason);
});

init();