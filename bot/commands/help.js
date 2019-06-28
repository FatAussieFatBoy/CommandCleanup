const discord = require('discord.js')

module.exports.run = async (client, message, args, level) => {
	// Check for invalid command usage
	if (args.length > 1) return message.channel.sendToUser(message.author, `Invalid command usage,`, utils.commandEmbed(client, this.help.name))

	// Check if the command has any arguments,
	// if not display all commands the user has permission to view
	let embed = {}
	if (!args[0]) {
		const myCommands = message.guild ? client.commands.filter(c => !c.config.permLevel || c.config.permLevel <= level) : client.commands.filter(c => !c.config.permLevel || c.config.permLevel <= level && !c.config.guildOnly)
		const commandNames = [...myCommands.values()]

		let currentCategory = ''
		embed = new discord.MessageEmbed({ description: `Here is a list of commands and their respective categories. If you'd like more details about a command you can use \`${client.prefix}help <command>\`.` })
		const sorted = myCommands.array().sort((p, c) => p.help.category > c.help.category ? 1 : p.help.name > c.help.name && p.help.category == c.help.category ? 1 : -1)
		let json = new Map()

		sorted.forEach(c => {
			if (!json.has(c.help.category)) json.set(c.help.category, new Map())
			const cat = json.get(c.help.category)
			cat.set(c.help.name, c)
		})

		json.forEach(cat => {
			let output = ''
			cat.forEach(c => {
				output += `**${client.prefix}${c.help.usage}**\n${c.help.description}\n\n`
			})
			embed.addField(`\u200b\n${json.getKey(cat)}`, output, false)
		})
	} else {
		// Show an individual command/category and it's more useful information
		let command = args[0]
		if (client.commands.has(command) || client.commands.has(client.aliases.get(command))) {
			command = client.commands.get(command) || client.commands.get(client.aliases.get(command))
			if (level < command.config.permLevel) return
			embed = commandEmbed(client, args[0])
		} else {
			//command doesn't exist, send error embed
			return message.author.send({
				embed: {
					color: 'ff0000',
					title: `**Oops!** <a:deny_gif:567114319024619530>`,
					description: `The command **\`${args[0]}\`** doesn't exist.\nTo display a list of all commands, use **\`${client.prefix}help\`**.`
				}
			}).then((m) => m.delete(20 * 1000))
		}
	}

	client.emit('debug', `sending help documentation to user, ${message.author.id}`)
	message.author.send(embed).then(() => {
		if (message.channel.guild) message.channel.send({ embed: { color: '00ff00', title: `**Success!** <:approve:567107353028329472>`, description: `Sent help documentation to ${message.author}`} }).then((m) => m.delete({ timeout: 2000 }))
	}).catch(() => {
		if (message.channel.guild) message.channel.send({ embed: { color: 'ff0000', title: `**Oops!** <a:deny_gif:567114319024619530>`, description: `Couldn't send help documentation to ${message.author}, please make sure they allow direct messages from server members.`} }).then((m) => m.delete({ timeout: 10000 }))
	})
}

exports.config = {
	enabled: false,
	guildOnly: false,
	aliases: ['h', 'halp', 'gimmehelp']
}

exports.help = {
	name: 'help',
	category: 'General',
	description: "Display all available commands for your permission level.",
	usage: 'help <command>'
}

function commandEmbed(client, commandName) {
	const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName))
	if (!command) throw new Error(`The command ${commandName} doesn't exist.`)

	return messageOptions = {
		embed: {
			description: `Here is the usage, alises and description of the command, **\`${command.help.name}\`**. Usage legend: *<optional>, (required)*`,
			fields: [
				{
					name: `\u200b\nUsage:`,
					value: `**.${command.help.usage}**\n${command.config.aliases.length > 0 ? `aliases: \`${command.config.aliases.join('\`, \`')}\`` : ''}`.paragraph(40),
					inline: true
				},
				{
					name: `\u200b\nDescription:`,
					value: command.help.description.paragraph(40),
					inline: true
				}
			]
		}
	}
}
