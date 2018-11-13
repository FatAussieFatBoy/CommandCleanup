//require functions so they can be called
const tools = require('./tools.js')

//Purge Command
module.exports.run = (client, prefix, message, args, pool, dbl) => {
	const clientMember = message.guild.member(client.user)

	const current_date = new Date()
	const date_limit = current_date.getTime() - (14 * 24 * 60 * 60 * 1000)

	//check if the user has permission to use the command
	if (!message.member.hasPermission('MANAGE_MESSAGES', false, true, true))
		return message.author.send(`You have insufficient permissions to use that command in \`${message.guild.name}\``).then((msg) => tools.addDeleteReaction(msg)).catch((err) => console.log(err.stack))

	//set the channels to check
	let channels = message.mentions.channels ? message.mentions.channels : message.guild.channels
	channels.forEach((channel, index) => {
		if (channel.type != 'text') return
		if (!channel.permissionsFor(clientMember).has('MANAGE_MESSAGES')) return

		console.log(`Looking through messages for users that no longer exist in channel ${channel} on ${message.guild.name}`)
		channel.fetchMessages()
			.then(messages => {
				if (!messages) return
				let msgs = messages.filter(msg => !channel.members.find(mbr => mbr.id === msg.author.id) && msg.createdTimestamp >= date_limit && msg.deletable)

				if (msgs.size === 0) return

				channel.bulkDelete(msgs.first(100), true)
					.then(deleted_msgs => tools.updateDeletedMessages(message.guild, deleted_msgs.size, pool))
					.catch(err => {
						console.log(err.stack)
						message.channel.send(`**An error has occured:** *I cannot delete these messages. Either the messages are older than 14 days or the code has stumbled across a problem..*`)
							.catch(err => console.log(err.stack))
					})
			}).catch(err => console.log(err.stack))
	})
}
