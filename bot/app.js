/* check node.js version is above 10 */
if (Number(process.version.slice(1).split('.')[0]) < 10) throw new Error('Node 10.0.0 or higher is required. Update Node on your system.')

const CommandCleanup = require('../index.js')

const client = new CommandCleanup.Client({
	disableEveryone: true,
	messageCacheLifetime: 600,
	messageSweepInterval: 300
})

const init = () => {
	client.prefix = require('./config.js').prefix
	client.levels = require('./config.js').levels

	client.loadCommands(`${__dirname}/commands/`)
	client.loadEvents(`${__dirname}/events/`)

	client.login(client.token)
}

client.on('error', e => console.error(e.stack || JSON.stringify(e) || e.toString()))
client.on('warn', e => console.warn(e))
client.on('debug', e => console.debug(e))

client.on('ready', () => {
	client.user.setActivity(`${client.prefix}help & ${client.prefix}invite`, { type: 'LISTENING' })
	console.log(`client on shard ${client.shard.ids[0]} ready and listening to; ${client.guilds.size} guilds, ${client.channels.filter(c => c.type == 'text').size} channels & ${client.users.size} users.`)
})

init()
