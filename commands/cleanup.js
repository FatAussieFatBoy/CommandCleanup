//require functions so they can be called
const tools = require('./tools.js')

//Cleanup Command
module.exports.run = (client, prefix, message, args, pool, dbl) => {

	const symbols = new RegExp(/[-!$%^&()_+|~={}\[\]:;?,.\/]/)
	const clientMember = message.guild.member(client.user)

	if (message.channel.type === 'dm') 
		return message.author.send('This command can only be used inside of guilds.')

	if (!message.channel.permissionsFor(clientMember).has('MANAGE_MESSAGES')) 
		return message.author.send(`I do not have permission to delete messages in \`#${message.channel.name}\`...\nIf you believe this is incorrect then please ensure the channels permissions allow CommandCleanup to \`MANAGE_MESSAGES\`.`).then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
	
	if (args.length === 0)
		return message.author.send(`Command Usage: *\`${prefix}cleanup (commands/bots/all/links/attachments/text/@user/@role) <number of messages>\`* | \`(required)\` \`<optional>\``).then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
		
	if (!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES'))
		return message.author.send(`You have insufficient permissions to use that command in \`#${message.channel.name}\``).then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
	
	const current_date = new Date()
	const date_limit = current_date.getTime() - (14 * 24 * 60 * 60 * 1000)

	let num = 100
	
	if(args.length == 2) {
		if(args[1].match(/^[0-9]+$/g)) {
			if(parseInt(args[1]) <= 100) {
				num = parseInt(args[1])
			} else {
				message.author.send(`\`${args[1]}\` is too large, the bot can delete a maximum of \`100\` messages at a time..`)
					.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
			}
		} else {
			return message.author.send(`Command Usage: *\`${prefix}cleanup (commands/bots/all/links/attachments/text/@user/@role) <number of messages>\`* | \`(required)\` \`<optional>\``).then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
			
		}
	}
	
	switch(args[0]) {
		case 'commands': //all messages that begin with the most common symbols used in commands
			message.channel.fetchMessages()
			.then(messages => {
				if (!messages) return
				let msgs = messages.filter(msg => symbols.test(msg.content.substring(0, 2)) && msg.id != message.id && msg.createdTimestamp >= date_limit && msg.deletable)
				
				if(msgs.size === 0) return message.author.send(`We could not find any command messages inside \`#${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
					.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
				message.channel.bulkDelete(msgs.first(num), true)
					.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
					.catch(err => { 
						console.log(err.stack);
						message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
							.catch(err => console.log(err.stack))
				})
			}).catch(err => console.log(err.stack))
			break
	
		case 'bots': //all messages that are posted by bots
			message.channel.fetchMessages()
			.then(messages => {
				if (!messages) return
				let msgs = messages.filter(msg => msg.author.bot && msg.pinned == false && msg.id != message.id && msg.createdTimestamp >= date_limit && msg.deletable)
				
				if(msgs.size === 0) return message.author.send(`We could not find any messages posted by bots inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
					.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
				message.channel.bulkDelete(msgs.first(num), true)
					.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
					.catch(err => { 
						console.log(err.stack);
						message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
							.catch(err => console.log(err.stack))
				})
			}).catch(err => console.log(err.stack))
			break
			
		case 'all': //all past 100 messages
			message.channel.fetchMessages({ limit: 100 })
			.then(messages => {
				if (!messages) return
				let msgs = messages.filter(msg => msg.pinned == false && msg.id != message.id && msg.createdTimestamp >= date_limit && msg.deletable)
				
				if(msgs.size === 0) return message.author.send(`We could not find any messages inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
					.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
				message.channel.bulkDelete(msgs.first(num), true)
					.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
					.catch(err => { 
						console.log(err.stack);
						message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
							.catch(err => console.log(err.stack))
				})
			}).catch(err => console.log(err.stack))
			break
			
		case 'links': //all messages that start with http or https
			message.channel.fetchMessages()
			.then(messages => {
				if (!messages) return
				let msgs = messages.filter(msg => msg.content.includes('http://') || msg.content.includes('https://') && msg.pinned == false && msg.id != message.id && msg.createdTimestamp >= date_limit && msg.deletable)
				
				if(msgs.size === 0) return message.author.send(`We could not find any messages with links inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
					.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
				message.channel.bulkDelete(msgs.first(num), true)
					.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
					.catch(err => { 
						console.log(err.stack);
						message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
							.catch(err => console.log(err.stack))
				})
			}).catch(err => console.log(err.stack))
			break
	
		case 'attachments': //all messages with attachments
			message.channel.fetchMessages()
			.then(messages => {
				if (!messages) return
				let msgs = messages.filter(msg => msg.attachments.size > 0 && msg.pinned == false && msg.id != message.id && msg.createdTimestamp >= date_limit && msg.deletable)
	
				if(msgs.size === 0) return message.author.send(`We could not find any messages with attachments inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
					.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
				message.channel.bulkDelete(msgs.first(num), true)
					.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
					.catch(err => { 
						console.log(err.stack);
						message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
							.catch(err => console.log(err.stack))
				})
			}).catch(err => console.log(err.stack))
			break
			
		case 'text': //all messages without attachments or links
			message.channel.fetchMessages()
			.then(messages => {
				if (!messages) return
				let msgs = messages.filter(msg => msg.attachments.size === 0 && !msg.content.includes('https://') && msg.pinned == false && !msg.content.includes('http://') && msg.deletable && msg.id != message.id && msg.createdTimestamp >= date_limit)
				
				if(msgs.size === 0) return message.author.send(`We could not find any messages containing only text inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
					.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
				message.channel.bulkDelete(msgs.first(num), true)
					.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
					.catch(err => { 
						console.log(err.stack);
						message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
							.catch(err => console.log(err.stack))
				})
			}).catch(err => console.log(err.stack))
			break
			
		default: //see if message has mentions, if not give command usage.

			//check if the message contains mentions
			if (!message.mentions) return message.author.send(`Command Usage: *\`${prefix}cleanup (commands/bots/all/links/attachments/@user/@role) <number of messages>\`* | \`(required)\` \`<optional>\``).then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
			
			let mentioned_users = message.mentions.users.array()
			let mentioned_roles = message.mentions.roles.array()
			
			if(mentioned_users) {
				mentioned_users.forEach((user, index) => {
					message.channel.fetchMessages()
						.then(messages => {
							if (!messages) return
							let msgs = messages.filter(msg => (!msg.guild.members.find(mbr => mbr.id ===  msg.author.id)|| msg.author.id === user.id) && msg.pinned == false && msg.id != message.id && msg.createdTimestamp >= date_limit && msg.deletable)
							
							if(msgs.size === 0) return message.author.send(`We could not find any messages from that user inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
								.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs.first(num), true)
								.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
								.catch(err => { 
									console.log(err.stack);
									message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
										.catch(err => console.log(err.stack))
								})
						})
				})
			}
			
			if(mentioned_roles) {
				mentioned_roles.forEach((role, index) => {
					message.channel.fetchMessages()
						.then(messages => {
							if (!messages) return
							let msgs = messages.filter(msg => (!msg.guild.members.find(mbr => mbr.id ===  msg.author.id) || msg.member.roles.find(r => r.id ===  role.id)) && msg.pinned == false && msg.id != message.id && msg.createdTimestamp >= date_limit && msg.deletable)
							
							if(msgs.size === 0) return message.author.send(`We could not find any messages from that role inside \`#${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
								.then(msg => tools.addDeleteReaction(msg)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs.first(num), true)
								.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
								.catch(err => { 
									console.log(err.stack);
									message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
										.catch(err => console.log(err.stack))
								})
						})
				})	
			}
	}

	if (message.deletable) message.delete(0).catch(err => console.log(err.stack))
}
