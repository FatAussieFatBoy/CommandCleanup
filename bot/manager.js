const { ShardingManager } = require('discord.js')
const { token } = require('./config.js')

const manager = new ShardingManager(`${__dirname}/app.js`, { token: token, totalShards: 'auto', respawn: true })
manager.spawn(this.totalShards)

manager.on('shardCreate', (shard) => {
	console.log(`Shard ${parseInt(shard.id + 1)}/${manager.totalShards} spawned`)

	shard.on('disconnect', () => console.log(`Shard ${parseInt(shard.id + 1)} disconnected`))
	shard.on('reconnecting', () => console.log(`Shard ${parseInt(shard.id + 1)} reconnecting..`))
})
