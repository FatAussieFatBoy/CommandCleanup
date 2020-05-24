const { owner, admins, support, invite, prefix, errorLogChannel } = require('./config');
const DBL = require('dblapi.js');

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
    try {
        client.shard.send({ type: 'debug', message: d });
    } catch (e) {
        console.error(e);
    }
});

client.on('warn', function(e) {
    try {
        client.shard.send({ type: 'warn', message: e });
    } catch (e) {
        console.error(e);
    }
});

client.on('error', function(e) {
    try {
        if (client.options.errorLogChannel) {
            let errorEmbed = client._constructErrorEmbed(e);
            client.channels.fetch(client.options.errorLogChannel).then(channel => { if(channel) channel.send('', errorEmbed) });
        }

        client.shard.send({ type: 'error', message: e.stack || e });
    } catch (e) {
        console.error(e);
    }
});

client.on('ready', function() {
    client.user.setActivity(`${client.commandPrefix}help & ${client.commandPrefix}invite`, { type: 'LISTENING' });
    client.emit('debug', `client ready and listening to; ${client.guilds.cache.size} guilds and ${client.channels.cache.filter(c => c.type === 'text').size} channels.`);
});

client.on('guildCreate', function(guild) {
    client.emit('debug', `${client.user.username} successfully added to guild ${guild.name}(${guild.id})`);
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

if (process.env.DBL_TOKEN) {
    const dbl = new DBL(process.env.DBL_TOKEN, client);

    dbl.on('posted', () => {
        client.emit('debug', `Server count posted to DBL`);
    });

    dbl.on('error', (e) => {
        client.emit('error', e);
    });
}

// handle all unhandled promise rejections and print the stack trace
process.on('unhandledRejection', error => {
    console.error(error);
});

init();