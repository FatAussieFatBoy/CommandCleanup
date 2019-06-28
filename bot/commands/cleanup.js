const Expressions = require('../../classes/utils/RegExpressions')

module.exports.run = (client, message, args, level) => {

	if (!message.guild || !message.guild.available) return client.logger.error(`Guild unavailable`)

	const clientM = message.guild.member(client.user)
	const member = message.guild.member(message.author)

	if (!clientM.permissionsIn(message.channel).has(8192, true)) {
		const noPerms = `I lack permissions to delete messages in \`#${message.channel.name}\`\nIf you believe this is incorrect, please check the channels permissions and allow CommandCleanup to \`MANAGE MESSAGES\` and \`READ MESSAGE HISTORY\`.`
		return message.channel.sendToUser(message.author, `Insufficient permissions,`, { embed: { color: 'ff0000', description: noPerms }, delete: 5000, reply: message.author })
	}

	let filters = []
	let properties = {
		/* command instance */
		command: message,

		/* channel targets */
		channels: [message.channel.id],

		/* fetch options */
		limit: 100,

		/* mentions and filter options */
		mentions: []
	}
	
	if (args.length > 0) {
		client.emit('debug', `${message.guild.name}: arguments found, [ ${args.join(', ')} ]`)
		let errors = []

		args.promise((arg, index, array) => {
			arg = arg.startsWith('-') ? arg.slice(1) : arg
			
			const nextIndex = parseInt(index) + 1
			const prevIndex = parseInt(index) - 1

			switch (arg) {
				case 'before':
					if (args[nextIndex] && args[nextIndex].match(/^[0-9]+$/g)) {
						properties['before'] = `${args[nextIndex]}`
						args.splice(nextIndex, 1)
					} else {
						let error = `Incorrect usage, please provide a valid message id after the \`before\` parameter.\nMessage id's should on contain numbers.`
						errors.push(error)
					}

					break

				case 'after':
					if (args[nextIndex] && args[nextIndex].match(/^[0-9]+$/g)) {
						properties['after'] = `${args[nextIndex]}`
						args.splice(nextIndex, 1)
					} else {
						let error = `Incorrect usage, please provide a valid message id after the \`after\` parameter.\nMessage id's should on contain numbers.`
						errors.push(error)
					}

					break

				case 'datelimit':
					if (args[nextIndex] && args[nextIndex].match(/^[0-9]*[a-z]+$/gi)) {

						const stringValue = args[nextIndex].replace(/[0-9]/g, '')
						const numericValue = parseInt(args[nextIndex].replace(/\D+/g, ''))

						switch(stringValue.toLowerCase()) {
							case 'd':
							case 'day':
							case 'days':
								if (numericValue > 14) {

									let error = `\`${numericValue}\` is too big, the maximum number of **days** we can delete messages up to is \`14\` days`
									errors.push(error)

									args.splice(nextIndex, 1)
									break
								}

								properties['datelimit'] = new Date().getTime() - (numericValue * 24 * 60 * 60 * 1000)
								// days * hours/day * minutes/hour * seconds/minute * milliseconds/second
								
								args.splice(nextIndex, 1)
								break

							case 'h':
							case 'hour':
							case 'hours':
								if (numericValue > parseInt(14 * 24)) {

									let error = `\`${numericValue}\` is too big, the maximum number of **hours** we can delete messages up to is \`${parseInt(14 * 24)}\` hours`
									errors.push(error)

									args.splice(nextIndex, 1)
									break
								}

								properties['datelimit'] = new Date().getTime() - (numericValue * 60 * 60 * 1000)
								// hours * minutes/hour * seconds/minute * milliseconds/second
								
								args.splice(nextIndex, 1)
								break

							case 'm':
							case 'minute':
							case 'minutes':
								if (numericValue > parseInt(14 * 24 * 60)) {

									let error = `\`${numericValue}\` is too big, the maximum number of **minutes** we can delete messages up to is \`${parseInt(14 * 24 * 60)}\` minutes`
									errors.push(error)

									args.splice(nextIndex, 1)
									break
								}

								properties['datelimit'] = new Date().getTime() - (numericValue * 60 * 1000)
								// minutes * seconds/minute * milliseconds/second
								
								args.splice(nextIndex, 1)
								break

							case 's':
							case 'second':
							case 'seconds':
								if (numericValue > parseInt(14 * 24 * 60)) {

									let error = `\`${numericValue}\` is too big, the maximum number of **seconds** we can delete messages up to is \`${parseInt(14 * 24 * 60 * 1000)}\` seconds`
									errors.push(error)

									args.splice(nextIndex, 1)
									break
								}

								properties['datelimit'] = new Date().getTime() - (numericValue * 1000)
								// minutes * seconds/minute * milliseconds/second
								
								args.splice(nextIndex, 1)
								break

							default:

								let error = `\`${stringValue}\` is not a valid duration.\nDurations: \`(d)ays\`, \`(h)ours\` and \`(m)inutes\``
								errors.push(error)
						}

						break

					} else {

						let error = `Incorrect usage, please provide a valid time frame after the \`datelimit\` parameter.\nTime frames should consist of a number followed by a letter representing the desired duration. *Example: \`24h\` would represent 24 hours/1 day.*`
						errors.push(error)
					
					}

					break

				/*
				case 'channels':
				case 'channel':
				case 'chnls':
				case 'chnl':
					if (args[nextIndex] && args[nextIndex].match(/<#([0-9]+)>/g)) {
						const possibleChnls = args.slice(parseInt(index) + 1)

						possibleChnls.some((value, index) => {
							if (!value.match(/<#([0-9]+)>/g)) {
								return true
							}

							const id = value.replace(/\D+/g, '')
							
							if (!message.guild.channels.has(id)) errors.push(`channel <#**${id}**> doesn't exist.`) 
							if (client.conflicts.has(id)) errors.push(`channel **#${client.channels.get(id).name}** is already being cleaned.`)
							if (!properties.channels.includes(id)) properties.channels.push(id)
							args.splice(nextIndex, 1)
						})
					} else {

						let error = `Incorrect usage, please provide channel mention(s) after the \`channels\` parameter.`
						errors.push(error)
					
					}

					break
				*/

				case 'attachments':
				case 'attachment':
				case 'files':
				case 'file':
					const possibleExtensions = args.slice(nextIndex)
					filters.push("FILES")

					if (possibleExtensions.length < 1) break

					let exts = []
					possibleExtensions.some((value, index) => {
						if (!value.match(/^\.[^.]+$/gi)) return true

						exts.push(value)
						args.splice(nextIndex, 1)
					})

					if (exts.length < 1) break

					exts.forEach((ext, index) => {
						if (!properties['files']) properties['files'] = []
						properties['files'].push(ext)
					})

					break

				case 'commands':
				case 'command':
				case 'cmds':
				case 'cmd':
					const possibleCmds = args.slice(nextIndex)
					filters.push("COMMANDS")

					if (possibleCmds.length < 1) break

					let cmds = []
					possibleCmds.some((value, index) => {
						if (!value.match(Expressions.symbols)) return true

						cmds.push(value)
						args.splice(nextIndex, 1)
					})

					if (cmds.length < 1) break

					cmds.forEach((cmd, index) => {
						if (!properties['commands']) properties['commands'] = []
						properties['commands'].push(cmd)
					})

					break

				case 'links':
				case 'link':
					const possibleLinks = args.slice(nextIndex)
					filters.push("LINKS")

					if (possibleLinks.length < 1) break

					let links = []
					possibleLinks.some((value, index) => {
						if (!value.match(Expressions.links)) return true

						links.push(value)
						args.splice(nextIndex, 1)
					})

					if (links.length < 1) break

					links.forEach((link, index) => {
						if (!properties['links']) properties['links'] = []
						properties['links'].push(link)
					})

					break

				case 'text':
				case 'txt':
					filters.push("TEXT")
					break

				case 'embeds':
				case 'embed':
				case 'embd':
					filters.push("EMBEDS")
					break

				case 'bots':
				case 'bot':
					if (!properties['mentions']) properties['mentions'] = []
						if (!properties['mentions'].includes('bots')) properties['mentions'].push('bots')
					
					break

				case 'purge':
					if (!properties['mentions']) properties['mentions'] = []
						if (!properties['mentions'].includes('purge')) properties['mentions'].push('purge')
					
					break

				case 'discord':
					filters.push("DISCORD")
					break

				case 'invites':
				case 'invite':
				case 'invs':
				case 'inv':
					filters.push("INVITES")
					break

				case 'limit':
					if (arg.match(/^[0-9]+$/g)) {
						properties.limit = parseInt(arg)
					}

					break

				case 'all':
					filters.push("ALL")
					break

				default:
					let error
					if (arg.match(/<@!?[0-9]+>/g)) {
						client.users.fetch(arg.replace(/\D+/g, '')).then((user) => {
							if (!properties['mentions']) properties['mentions'] = []
								if (!properties['mentions'].includes(user.id)) properties['mentions'].push(`u:${user.id}`)
						}).catch((error) => {
							error = `User \`${arg.replace(/\D+/g, '')}\` couldn't be found.`
							errors.push(error)
						})

						break
					}

					if (arg.match(/<@&[0-9]+>/g)) {
						const role = message.guild.roles.get(arg.replace(/\D+/g, ''))
						if (role) {
							if (!properties['mentions']) properties['mentions'] = []
								if (!properties['mentions'].includes(role.id)) properties['mentions'].push(`r:${role.id}`)

							break
						}

						error = `Role \`${arg.replace(/\D+/g, '')}\` couldn't be found.`
						errors.push(error)

						break
					}

					if (arg.match(/^[0-9]+$/g)) {
						properties.limit = parseInt(arg)
						break
					}

					errors.push(`\`${arg}\` is not a valid parameter.`)
			}
		}).then(() => {
			if (errors.length > 0) {
				client.emit('debug', `${message.guild.name}: errors found, [ ${errors.join(', ')} ]`)
				let error = `• ${errors.join('\n\n• ')}\n\nfor further assistance use \`${client.prefix}help\`.`
				return message.channel.sendToUser(message.author, `Encountered an error,`, {
					embed: {
						color: 'ff0000',
						description: `We've found a few errors with the parameters you've provided..\n\n${error}`
					}, delay: 10000, reply: message.author
				})
			}

			if (filters.length < 1) {
				if (properties.before || properties.after || properties.mentions) filters = ['ALL']
				else return message.channel.sendToUser(message.author, `Encountered an error,`, {
					embed: {
						color: 'ff0000',
						description: `You must define a list of parameters to match messages inside the channel.\nFor a list of parameters please see our [DiscordBots Page](https://discordbots.org/bot/420013638468894731)`
					}, delay: 10000, reply: message.author
				})
			}

			for (let i = 0; i < properties.channels.length; i++) {
				const channel = message.guild.channels.has(properties.channels[i]) ? message.guild.channels.get(properties.channels[i]) : null
				if (channel) channel.clean(filters, properties).then(dltd => {
					if (dltd.size > 0) channel.send({ embed: { color: '00ff00', description: `successfully deleted ${dltd.size} messages from #${channel.name}` } }).then(m => m.delete({ timeout: 3000 }))
					client.emit('debug', `${message.guild.name}: deleted ${dltd.size} messages from #${message.channel.name}`)
				})
			}
		})
	} else {
		return message.channel.sendToUser(message.author, `Encountered an error,`, {
			embed: {
				color: 'ff0000',
				description: `The cleanup command requires parameters to function, if you would like to remove all messages just add \`-all\` to the end of the command.\nFor a list of the other parameters please see our [DiscordBots Page](https://discordbots.org/bot/420013638468894731)`
			}, delay: 30000, reply: message.author
		})
	}
}

exports.config = {
	enabled: false,
	guildOnly: true,
	aliases: ['clean'],
	permLevel: 2
}

exports.help = {
	name: 'cleanup',
	category: 'Moderation',
	description: "Used to mass-clean messages from a text channel, you can also use parameters to target certain messages based on their content.",
	usage: 'cleanup <parameter(s)>'
}
