//Leaderboard Command
module.exports.run = async (client, prefix, message, args, con, dbl) => {
	
	let ranks = [':laughing:', ':trophy:', ':second_place:', ':third_place:', ':medal:', ':medal:']

	con.getConnection((err, connection) => {
		if(err) throw err
		if(!connection) {
			console.log('Connection could not be found to contact MySQL')
		} else {
			connection.query(`SELECT * FROM guilds ORDER BY messages_deleted DESC LIMIT 5`, (err, rows) => {
				if(err) console.log(err.stack)
				if(!rows) return console.log(`ERROR: The database has no rows`)
		
				let str = ''
				rows.forEach((row, index) => {
					str += `\n${ranks[index + 1]} - Guild \`${rows[index].name}\` with a total of \`${rows[index].messages_deleted}\` messages deleted.\n`
			
				connection.release()
			})
			
			message.author.send(`**--- CommandCleanup Leaderboard ---**\n${str}\nIf you're guild isn't listed here you can visit https://commandcleanup.com and use the global leaderboard to search for your guilds stats`)
				.then(msg => msg.delete(30 * 1000))
				.catch(err => console.log(err.stack))
		}
	})
}
