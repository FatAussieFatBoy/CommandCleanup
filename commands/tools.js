module.exports = {
	//addDeleteReaction function
	addDeleteReaction: (message) => {
		//add reaction to message so it can be deleted
		message.react('\u274c').catch((err) => console.log(err.stack))
	
		//filter the collector and set the message to expire after 5 minutes
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
	},

	//updateDeletedMessages function
	updateDeletedMessages: (guild, msgCount, pool) => {
		/*
		pool.getConnection((err, conn) => {
			if (err) { 
				console.log(err.stack)
				pool.releaseConnection(conn)
			}
	
			if (conn) {
				conn.query(`SELECT * FROM \`guilds\` WHERE \`id\` = '${guild.id}'`, (err, rows) => {
					if (err) { 
						console.log(err.stack)
						pool.releaseConnection(conn)
					}
	
					if (rows.length < 1) {
						conn.query(`INSERT INTO \`guilds\` (name, id, region, messages_deleted) VALUES ('${guild.name.replace("\'", "")}', '${guild.id}', '${guild.region}', '${msgCount}')`, (err, rows) => {
							if (err) { 
								console.log(err.stack)
								pool.releaseConnection(conn)
							}
	
							pool.releaseConnection(conn)
							console.log(`Database table for guild ${guild.name} created`)
						})
					} else {
						let messages_deleted = rows[0].messages_deleted
						conn.query(`UPDATE \`guilds\` SET \`messages_deleted\` = ${messages_deleted + msgCount}, name = '${guild.name.replace("\'", "")}', region = '${guild.region}' WHERE id = '${guild.id}'`, (err, rows) => {
							if (err) { 
								console.log(err.stack)
								pool.releaseConnection(conn)
							}
	
							pool.releaseConnection(conn)
							console.log(`Database table for guild ${guild.name} updated`)
						})
					}
				})
			}
		})
		*/
	}
}
