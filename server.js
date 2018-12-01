//dependencies
const { ShardingManager } = require('discord.js')
const mysql = require('mysql2')

const { TOKEN } = require('./.hidden/config.js')

//constants
const manager = new ShardingManager(`${__dirname}/bot.js`, { token: TOKEN, totalShards: 'auto', respawn: true })

manager.spawn(this.totalShards, 7500) //spawn shards automatically depending on number of servers

manager.on('launch', (shard) => {
	console.log(`Shart ${parseInt(shard.id) + 1}/${manager.totalShards} spawned`)

	//called when the shard is ready
	shard.on('ready', () => {
		shard.fetchClientValue('guilds.size')
			.then((count) => console.log(`Shart ${shard.id} ready and listening to ${count} servers`))
			.catch((err) => console.log(err.stack))
	})

	//called when the shard diconnects
	shard.on('disconnect', () => {
		console.log(`Shart ${shard.id} disconnected`)
	})
})
