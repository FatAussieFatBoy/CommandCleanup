//Announce Command
module.exports.run = (client, prefix, message, args, pool, dbl) => {

	const allowed_to_use_command = ['253006486349938688']
	let already_sent_announcement = []
  
	if (allowed_to_use_command.includes(`${message.author.id}`)) {
		if (message.channel.type != 'dm') return message.author.send(`This command can only be used in Direct Messages.`).then(msg => addDeleteReaction(msg)).catch(err => console.log(err.stack))
		
		client.guilds.forEach((guild) => {
			//check if the guild owner has already been sent a message
			if (already_sent_announcement.includes(`${guild.owner.id}`) {
				//if they haven't been sent the message add them to the array to prevent message spam
				already_sent_announcement.push(`${guild.owner.id}`)
        
				//send the guild owner the announcement
				guild.owner.send(`**CommandCleanup Announcement**\n${message}`).then(msg => addDeleteReaction(msg)).catch(err => console.log(err.stack))
			}
		})
	}
  
	function addDeleteReaction(message) {
		//add reaction to message so it can be deleted
		message.react('❌').catch((err) => console.log(err.stack))
		
		//filter the collector and set the message to expire after 5 minutes.
		const filter = (reaction, user) => user.id != message.author.id && reaction.emoji.name === '❌'
		let collector = message.createReactionCollector(filter, {time: 300 * 1000})
		
		//when the reaction is collected by the collector stop the collector
		collector.on('collect', (r) => {
			collector.stop()
		})
		
		//when the collector stops delete the message
		collector.on('end', (collected) => {
			if (message.deletable) message.delete(0)
		})
	}
}
