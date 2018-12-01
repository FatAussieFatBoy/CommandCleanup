//dependencies
const utf8 = require('utf8')

module.exports = {
	//module.exports.addDeleteReaction function
	addDeleteReaction: (message) => {
		//create options variable
		let options = {}

		if (message.channel.type === 'dm') {
			//set the time option to 30 seconds
			options['time'] = 30 * 1000
			/*
				don't add the reaction to direct messages until I can find a fix 
				for the collector not working with shards over DM's 
			*/
		} else {
			//set the time option to 5 minutes
			options['time'] = 5 * 60 * 1000
			//add reaction to message so it can be deleted sooner
			message.react('\u274c').catch((err) => console.log(err.stack))
		}

		//filter the collector and set the message to expire after 5 minutes
		const filter = (reaction, user) => user.id != message.author.id && reaction.emoji.name === '❌'
		let collector = message.createReactionCollector(filter, options)
	
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
						conn.query(`INSERT INTO \`guilds\` (name, id, shard_id, region, messages_deleted) VALUES ('${utf8.encode(guild.name.replace(/[\'\`]/g, ""))}', '${guild.id}', ${guild.client.shard.id}, '${guild.region}', '${msgCount}')`, (err, rows) => {
							if (err) { 
								console.log(err.stack)
								pool.releaseConnection(conn)
							}
	
							pool.releaseConnection(conn)
							console.log(`${guild.name}: create database entry { messages_deleted: ${msgCount} }`)
						})
					} else {
						let messages_deleted = rows[0].messages_deleted
						conn.query(`UPDATE \`guilds\` SET \`messages_deleted\` = ${messages_deleted + msgCount}, name = '${utf8.encode(guild.name.replace(/[\'\`]/g, ""))}', region = '${guild.region}', shard_id = ${guild.client.shard.id} WHERE id = '${guild.id}'`, (err, rows) => {
							if (err) { 
								console.log(err.stack)
								pool.releaseConnection(conn)
							}
	
							pool.releaseConnection(conn)
							console.log(`${guild.name}: updated database entry { messages_deleted: ${messages_deleted + msgCount} }`)
						})
					}
				})
			}
		})
	},

	//used to get the total server count from all shards
	updateServerCount: (client, callback) => {
		client.shard.fetchClientValues('guilds.size')
			.then((results) => {
				return callback(results.reduce((prev, next) => prev + next, 0))
			}).catch((err) => console.log(err.stack))
	},

	//used to send a message to the first available channel in the guild
	sendMessageToGuild: (client, guild, message, try_channel) => {
		//get the guild member of the client
		const clientMember = guild.member(client.user)

		let promise = new Promise((resolve, reject) => {
			if ((try_channel != null && try_channel != undefined) && clientMember.permissionsIn(try_channel).has(3072, true)) { //permission to view the channel and send messages
				try_channel.send(`${message}`)
					.then(msg => {
						module.exports.addDeleteReaction(msg)
						resolve(msg)
					})
					.catch((err) => reject(err.stack))
			} else {
				guild.channels.some((channel, index) => {
						//find first channel that the bot can message in
						if (channel.type === 'text' && clientMember.permissionsIn(channel).has(3072, true)) { //permission to view the channel and send messages
							channel.send(`${message}`)
								.then(msg => {
									module.exports.addDeleteReaction(msg)
									resolve(msg)
								})
								.catch((err) => reject(err.stack))
							return true //stop the loop
						}

						if (index === guild.channels.array().length - 1) {
							reject(`${guild.name} has no available channels to send messages too`)
						}
					})
			}
		})

		return promise
	},

	//async for each loop function
	asyncForEach: async (array, callback, complete) => {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array)
		}

		await complete()
	}
}
