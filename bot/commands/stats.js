const v8 = require('v8')
const { version, MessageEmbed } = require('discord.js')
const moment = require('moment')
require('moment-duration-format')

module.exports.run = async (client, message, args, level) => {
	let guilds, users, channels, uptime, regions = []
	// fetch total number of guilds, users and channels across all guilds
	await client.shard.fetchClientValues('guilds.size').then((count) => guilds = count.reduce((p, n) => p + n, 0))
	await client.shard.fetchClientValues('users.size').then((count) => users = count.reduce((p, n) => p + n, 0))
	await client.shard.fetchClientValues('channels.size').then((count) => channels = count.reduce((p, n) => p + n, 0))
	await client.shard.fetchClientValues('guilds').then((glds) => glds.forEach((gld) => regions.push(gld.region)))

	// fetch longest uptime of all shards
	await client.shard.fetchClientValues('uptime').then((ts) => uptime = ts.reduce((p, n) => Math.max(p, n), 0))

	const heapStats = v8.getHeapStatistics()
	const duration = moment.duration(uptime).format(" D [days], H [hrs], m [mins] & s [secs]")

	const botInfo = [`**Shard Count:** \`${client.shard.count}\``, `**Memory Usage:** \`${(heapStats.used_heap_size / 1024 / 1024).toFixed(2)}/${(heapStats.total_heap_size / 1024 / 1024).toFixed(2)} MB\``, `**Uptime:** \`${duration}\``, `**API Latency:** \`${Math.round(client.ws.ping)}ms\``]
	const guildInfo = [`**Server Count:** \`${guilds.toLocaleString()}\``, `**User Count:** \`${users.toLocaleString()}\``, `**Channel Count:** \`${channels.toLocaleString()}\``]
	const miscInfo = [`**Discord.js Version:** \`v${version}\``, `**Node Version:** \`${process.version}\``]
	const regionInfo = [`**`]

	const embed = new MessageEmbed()
		// bot information
		.addField(`• Bot Information`, `${botInfo.join(' \u200b ')}\n\u200b`, false)
		// guild information
		.addField('• Guild Information', guildInfo.join('\n'), true)
		// version information
		.addField('• Misc Information', miscInfo.join('\n'), true)
		// region information
		.addField('• Region Information', )

	message.channel.send(`Here is a list of useful bot/system statistics.`, embed)
}

exports.config = {
	enabled: false,
	guildOnly: false,
	aliases: ['system'],
	permLevel: 8
}

exports.help = {
	name: 'stats',
	category: 'System',
	description: "Display current system/bot statistics.",
	usage: 'stats'
}