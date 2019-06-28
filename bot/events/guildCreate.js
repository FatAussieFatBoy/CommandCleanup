module.exports = async (client, guild) => {
	const details = {
		name: guild.name,
		id: guild.id,
		owner: guild.owner.user.username,
		members: guild.memberCount,
		shard: client.shard.id
	}

	client.emit('debug', `CommandCleanup was added to, ${JSON.stringify(details)}`)
}