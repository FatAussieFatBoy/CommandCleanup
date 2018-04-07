//Leaderboard Command
module.exports.run = async (client, prefix, message, args, con, dbl) => {
	con.query(`SELECT * FROM guilds ORDER BY messages_deleted DESC LIMIT 5`, (err, rows) => {
		if(err) console.log(err.stack)
		if(!rows) return console.log(`ERROR: The database has no rows`)

		let str = ''
		let words = ['medal', 'trophy', 'second_place', 'third_place', 'medal', 'medal']
		rows.forEach((row, index) => {
			str += `\n:${words[index + 1]}: - Guild \`${rows[index].name}\` with a total of \`${rows[index].messages_deleted}\` messages deleted.\n`
		})
		
		message.author.send(`**--- CommandCleanup Leaderboard ---**\n${str}`)
			.then(msg => msg.delete(30 * 1000))
			.catch(err => console.log(err.stack))
	})
	
	if (message.channel.type != 'dm') {
		if (message.channel.permissionsFor(message.guild.member(client.user)).has('MANAGE_MESSAGES')) {
			message.delete(0).catch(err => console.log(err.stack))
		}
	}
}
