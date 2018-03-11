//Cleaned Up Command
module.exports.run = (client, prefix, message, args, con, dbl) => {
	if (message.channel.type === 'dm') return message.author.send('This command can only be used inside of guilds')
	if (dbl.hasVoted(`${message.author.id}`)) {
		con.query(`SELECT * FROM guilds WHERE id = '${message.guild.id}'`, (err, rows) => {
			if(err) console.log(err.stack)
	
			if(!rows[0]) return message.author.send(`Guild \`${messages.guild.name}\` could not be found in the database`)
	
			let deleted_messages = rows[0].messages_deleted
			let init_date = rows[0].initiated_date
			message.author.send(`A total of \`${deleted_messages}\` messages have been deleted from \`${message.guild.name}\` since \`${init_date.toString().split(' ').slice(0, 4).join(' ')}\``)
		})
	} else {
		message.author.send(`This command is only available for users that have upvoted the bot on https://discordbots.org, if you'd like to upvote the bot use \`${prefix}upvote\` to be sent a link where you can upvote`).catch(err => console.log(err.stack))
	}
	message.delete(0).catch(err => console.log(err.stack))
}