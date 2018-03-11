//Leaderboard Command
module.exports.run = async (client, prefix, message, args, con, dbl) => {
	if (dbl.hasVoted(`${message.author.id}`)) {
		con.query(`SELECT * FROM guilds ORDER BY messages_deleted DESC LIMIT 5`, (err, rows) => {
			if(err) console.log(err.stack)
			if(!rows) return console.log(`ERROR: The database has no rows`)

			let str = ''
			let words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'keycap_ten']
			rows.forEach((row, index) => {
				str += `\n:${words[index + 1]}: - Guild \`${rows[index].name}\` with a total of \`${rows[index].messages_deleted}\` messages deleted.\n`
			})
			message.author.send(`**--- CommandCleanup Leaderboard ---**\n${str}`)
		})
	} else {
		message.author.send(`This command is only available for users that have upvoted the bot, if you'd like to upvote the bot use \`${prefix}upvote\``).catch(err => console.log(err.stack))
	}
	message.delete(0).catch(err => console.log(err.stack))
}
