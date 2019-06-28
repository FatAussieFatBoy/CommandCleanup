module.exports = async (client, message) => {
	if (message.author.bot) return
	if (message.guild && message.guild.available) {
		/* check for autoscans */
	}

	/* validation */
	if (!message.content.startsWith(client.prefix)) return

	const args = message.content.slice(client.prefix.length).trim().split(/\s+/g)
	const command = args.shift().toLowerCase()

	let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
	if (!cmd) return client.emit('debug', `command ${command} doesn't exist`)

	if (!cmd.config.enabled) return message.channel.sendToUser(message.author, `Encountered an error,`, { embed: { color: 'ff0000', description: `The command **${cmd.help.name}** has been disabled.`}, delay: 5000  })
	if (!message.guild && cmd.config.guildOnly) return message.channel.sendToUser(message.author, `Encountered an error,`, { embed: { color: 'ff0000', description: `The command **${cmd.help.name}** can only be used inside a guild.`, }, delay: 20000  })
	
	const level = getLevel(message)
	if (level < cmd.config.permLevel) return message.channel.sendToUser(message.author, `Insufficient permissions,`, { embed: { color: 'ff0000', description: `You have insufficient permissions to use the command **\`${cmd.help.name}\`**.\nYour access level: \`${client.levels.find(l => l.level == level).name}\` | Required access level: \`${client.levels.find(l => l.level == cmd.config.permLevel).name}\`` }, delay: 20000 })

	await cmd.run(client, message, args, level)
	if (message.deletable) message.delete(0)
}

function getLevel(message) {
	const order = message.client.levels.slice(0).sort((p, n) => p.level < n.level ? 1 : -1)
	while (order.length) {
		const currentLevel = order.shift()
		if (currentLevel.check(message)) return currentLevel.level
	}
}
