//Leaderboard Command
module.exports.run = async (client, prefix, message, args, pool, dbl) => {
	
	let ranks = [':laughing:', ':trophy:', ':second_place:', ':third_place:', ':medal:', ':medal:']
	let str = ''

	pool.getConnection((err, conn) => {
		if(conn) {
			conn.query(`SELECT * FROM guilds ORDER BY messages_deleted DESC LIMIT 5`, (err, rows) => {
				if(err) console.log(err.stack)
				if(!rows) return console.log(`ERROR: The database has no rows`)
		
				rows.forEach((row, index) => {
					str += `\n${ranks[index + 1]} - Guild \`${rows[index].name}\` with a total of \`${rows[index].messages_deleted}\` messages deleted.\n`
				})
				
				message.author.send(`**--- CommandCleanup Leaderboard ---**\n${str}\nIf you're guild isn't listed here you can visit https://commandcleanup.com and use the global leaderboard to search for your guilds stats`)
					.then(msg => addDeleteReaction(msg))
					.catch(err => console.log(err.stack))
				
				pool.releaseConnection(conn)
			})
		}
	})
	
	//add a delete emoji to a message so it can be deleted
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
