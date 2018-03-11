//Cleanup Command
module.exports.run = (client, prefix, message, args, con, dbl) => {

	const symbols = new RegExp(/[-!$%^&()_+|~={}\[\]:;?,.\/]/)
	const clientMember = message.guild.member(client.user)

	if (message.channel.type === 'dm') return message.author.send('This command can only be used inside of guilds.')
	if (!message.channel.permissionsFor(clientMember).has('MANAGE_MESSAGES')) {
		message.author.send(`I do not have permission to delete messages in \`#${message.channel.name}\`...\nIf you believe this is incorrect then please ensure the channels permissions allow CommandCleanup to \`MANAGE_MESSAGES\`.`)
		return
	}
	if (args.length > 0) {
		if (message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES')) {
			var num
			if(args[0].match(/^\d+$/g)) {
				if(parseInt(args[0]) <= 100) {
					num = parseInt(args[0])
					args.shift()
				} else {
					message.author.send(`\`${args[0]}\` is too large, the bot can only delete a maximum of \`100\` messages at a time.`)
						.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
				}
			} else {
				num = 100
			}
			switch(args[0]) {
				case 'commands': //all messages that begin with the most common symbols used in commands
					message.channel.fetchMessages({ limit: 100 })
					.then(messages => {
						let msgs = messages.filter(msg => symbols.test(msg.content.substring(0, 2)) && msg.id != message.id)
						
						if(msgs.size === 0) return message.author.send(`We could not find any command messages inside \`#${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
							.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						message.channel.bulkDelete(msgs.first(num), true).catch(err => console.log(err.stack))
							.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
							.catch(err => console.log(err.stack))
					}).catch(err => console.log(err.stack))
					break
		
				case 'bots': //all messages that are posted by bots
					message.channel.fetchMessages({ limit: 100 })
					.then(messages => {
						let msgs = messages.filter(msg => msg.author.bot && msg.id != message.id)
						
						if(msgs.size === 0) return message.author.send(`We could not find any messages posted by bots inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
							.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						message.channel.bulkDelete(msgs.first(num), true).catch(err => console.log(err.stack))
							.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
							.catch(err => console.log(err.stack))
					}).catch(err => console.log(err.stack))
					break
					
				case 'all': //all past 100 messages
					message.channel.fetchMessages({ limit: 100 })
					.then(messages => {
						let msgs = messages.filter(msg => msg.id != message.id)
						
						if(msgs.size === 0) return message.author.send(`We could not find any messages inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
							.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						message.channel.bulkDelete(msgs.first(num), true).catch(err => console.log(err.stack))
							.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
							.catch(err => console.log(err.stack))
					}).catch(err => console.log(err.stack))
					break
					
				case 'links': //all messages that start with http or https
					message.channel.fetchMessages({ limit: 100 })
					.then(messages => {
						let msgs = messages.filter(msg => msg.content.includes('http://') || msg.content.includes('https://') && msg.id != message.id)
						
						if(msgs.size === 0) return message.author.send(`We could not find any messages with links inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
							.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						message.channel.bulkDelete(msgs.first(num), true).catch(err => console.log(err.stack))
							.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
							.catch(err => console.log(err.stack))
					}).catch(err => console.log(err.stack))
					break
	
				case 'attachments': //all messages with attachments (images, embeds)
					message.channel.fetchMessages({ limit: 100 })
					.then(messages => {
						let msgs = messages.filter(msg => msg.attachments.size > 0 && msg.id != message.id)
	
						if(msgs.size === 0) return message.author.send(`We could not find any messages with attachments inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
							.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						message.channel.bulkDelete(msgs.first(num), true).catch(err => console.log(err.stack))
							.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
							.catch(err => console.log(err.stack))
					}).catch(err => console.log(err.stack))
					break
					
				default: //see if message has mentions, if not give command usage.
					if (message.mentions) {
						let mentioned_users = message.mentions.users.array()
						let mentioned_roles = message.mentions.roles.array()
						
						if(mentioned_users) {
							mentioned_users.forEach((user, index) => {
								message.channel.fetchMessages({ limit: 100 })
									.then(messages => {
										let msgs = messages.filter(msg => msg.author.id === user.id && msg.id != message.id)
										
										if(msgs.size === 0) return message.author.send(`We could not find any messages from that user inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
											.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
										message.channel.bulkDelete(msgs.first(num), true).catch(err => console.log(err.stack))
											.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
											.catch(err => console.log(err.stack))
								}).catch(err => console.log(err.stack))
							})
						}
						
						if(mentioned_roles) {
							mentioned_roles.forEach((role, index) => {
								message.channel.fetchMessages({ limit: 100 })
									.then(messages => {
										let msgs = messages.filter(msg => msg.member.roles.exists('id', role.id) && msg.id != message.id)
										
										if(msgs.size === 0) return message.author.send(`We could not find any messages from that role inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
											.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
										message.channel.bulkDelete(msgs.first(num), true).catch(err => console.log(err.stack))
											.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
											.catch(err => console.log(err.stack))
								}).catch(err => console.log(err.stack))
							})	
						}
					} else {
						message.author.send(`Command Usage: *\`${prefix}cleanup <number of messages> (commands/bots/all/links/attachments/@user/@role)\`* | \`(required)\` \`<optional>\``).catch(err => console.log(err.stack))
					}
			}
		} else {
			message.author.send(`You have insufficient permissions to use that command in \`#${message.channel.name}\``).then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))	
		}
	} else {
		message.author.send(`Command Usage: *\`${prefix}cleanup <number of messages> (commands/bots/all/links/attachments/@user/@role)\`* | \`(required)\` \`<optional>\``).catch(err => console.log(err.stack))
	}
	message.delete(0).catch(err => console.log(err.stack))

	function UpdateDeletedMessages(guild, msgCount) {
	con.query(`SELECT * FROM guilds WHERE id = '${guild.id}'`, (err, rows) => {
		if(err) console.log(err.stack)

		let sql
		
		if(rows.length < 1) {
			sql = `INSERT INTO guilds (name, id, member_count, messages_deleted) VALUES ('${guild.name.replace('\'', '')}', '${guild.id}', ${guild.memberCount}, ${msgCount})`
			console.log(`Database table for guild ${guild.name} created`)
		} else {
			let messages_deleted = rows[0].messages_deleted
			sql = `UPDATE guilds SET messages_deleted = ${messages_deleted + msgCount}, name = '${guild.name.replace('\'', '')}' WHERE id = '${guild.id}'`
			console.log(`Database table for guild ${guild.name} updated`)
		}

		con.query(sql)
	})
}
}
