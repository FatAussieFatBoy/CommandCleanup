//require functions so they can be called
const tools = require('./tools.js')

//Leaderboard Command
module.exports.run = async (client, prefix, message, args, pool, dbl) => {
	
	let ranks = [':laughing:', ':trophy:', ':second_place:', ':third_place:', ':medal:', ':medal:']
	let str = ''

	pool.getConnection((err, conn) => {
		if (err) {
			throw err
			pool.releaseConnection(conn)
		}

		if(conn) {
			conn.query(`SELECT * FROM guilds ORDER BY messages_deleted DESC LIMIT 5`, (err, rows) => {
				if(err) {
					throw err
					pool.releaseConnection(conn)
				}

				if(rows) {
					rows.forEach((row, index) => {
						str += `\n${ranks[index + 1]} - Guild \`${rows[index].name}\` with a total of \`${rows[index].messages_deleted}\` messages deleted.\n`
					})
					
					message.author.send(`**--- CommandCleanup Leaderboard ---**\n${str}\nIf you're guild isn't listed here you can visit https://commandcleanup.com and use the global leaderboard to search for your guilds stats`)
						.then(msg => tools.addDeleteReaction(msg))
						.catch(err => console.log(err.stack))
					
					pool.releaseConnection(conn)
				} else {
					console.log(`ERROR: The database has no rows`)
					pool.releaseConnection(conn)
				}
			})
		}
	})
}
