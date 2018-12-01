//dependencies
const discord = require('discord.js')
const mysql = require('mysql2')

//config exports
const { PREFIX } = require('./.hidden/config.js')

//create client and define shard properties
const client = new discord.Client({ disableEveryone: true, shardId: process.SHARD_ID, shardCount: process.SHARD_COUNT })
const tools = require('./commands/tools.js')

//create mySQL connection pool
const pool = mysql.createPool({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'password',
	database: 'database'
})

//login client
client.login(process.CLIENT_TOKEN)

//ready event
client.on('ready', () => {
	//remove all messages older than a year from the cache
	client.sweepMessages(1 * 365 * 24 * 60 * 60 * 1000)

	//update all guilds in the mysql with there respective shard id
	pool.getConnection((err, conn) => {
		if (conn) {
			let guildSQL = []
			client.guilds.forEach((guild, index) => {
				guildSQL.push(`id = '${guild.id}'`)
			})

			//update all guild shard_id's in the database
			conn.query(`UPDATE guilds SET shard_id = ${client.shard.id} WHERE ${guildSQL.join(' OR ')}`, (err, rows) => {
				if (err) { 
					console.log(err.stack)
					pool.releaseConnection(conn)
				}
				
				pool.releaseConnection(conn)
			})

			//delete all database entries of guilds that no longer use the bot on this shard
			conn.query(`SELECT * FROM guilds WHERE shard_id = ${client.shard.id}`, (err, rows) => {
				if (err) {
					console.log(err.stack)
					pool.releaseConnection(conn)
				} else {
					if (rows.length > 0) {
						let toDelete = []
						//loop through all guilds in the database
						rows.forEach((row, index) => {
							//check if the client is still active on that guild
							if (!client.guilds.has(`${row.id}`)) {
								toDelete.push(`id = '${row.id}'`)
								console.log(`Database table for guild ${row.name} deleted`)
							}
						})

						if (toDelete.length > 0) {
							conn.query(`DELETE FROM guilds WHERE ${toDelete.join(' OR ')}`, (err) => {
								if (err) {
									console.log(err.stack)
									pool.releaseConnection(conn)
								}
							})
						}
					}

					pool.releaseConnection(conn)
				}
			})
		}
	})

	//check if this shard is the last shard in the list
	if ((parseInt(client.shard.id) + 1) === client.shard.count) {
		client.user.setActivity(`${PREFIX}help & ${PREFIX}invite`, { type: 'LISTENING' })

		const DBL = require('dblapi.js')
		const dbl = new DBL(DBL_TOKEN)

		//update discordbots.org stats every 15 minutes
		client.setInterval(() => {
			//update the server count
			tools.updateServerCount(client, (count) => {
				//post stats to discordbots.org
				dbl.postStats(count, '', client.shard.count)
				//send console updated stats
				console.log(`updated discordbots.org; { server_count: ${count}, shard_count: ${client.shard.count} }`)
			})
		}, 900 * 1000)
	}
})

client.on('message', async message => {
	//if the command is from a bot but not from CommandCleanup don't accept it
	if (message.author.bot && message.author.id != '420013638468894731') return

	if (message.channel.type != 'dm') {
		if (/(?:https:?\/)?discord(?:app.com\/invite|.gg)/gi.test(message.content)) {
			let messageMember = message.guild.member(message.author)
			if (messageMember && !messageMember.permissionsIn(message.channel).has('MANAGE_MESSAGES', true)) {
			    	if (message.deletable) return message.delete(0).catch(err => console.log(err.stack))
			}
		}
	}
	
	if (!message.content.startsWith(PREFIX)) return

	let syntaxed = message.content.replace(/([,] (?=[\S\n])|[,]|[\)\}\]] (?=[\S\n])|[\)\}\]]|[\(\{\[] (?=[\S\n])|[\(\{\[]|\s)/g, ' ') //replace common command mistakes so the bot is more friendly <3

	const args = syntaxed.toLowerCase().split(/\s+/g)
	const command = args.shift().slice(PREFIX.length)

	try {
		let cmdFile = require(`./commands/${command.toLowerCase()}.js`)
		cmdFile.run(client, PREFIX, message, args, pool)
	} catch (err) {
		//console.log(err.stack) //when debugging
	}

})

//client join Guild Event
client.on('guildCreate', guild => {
	guild.owner.user.send(`CommandCleanup has been added to your guild \`${guild.name}\`, if you'd like to see the features and commands for this bot please use the link provided below and also consider giving the bot an upvote...\nhttps://discordbots.org/bot/420013638468894731`)
		.catch((err) => tools.sendMessageToGuild(client, guild, `<@${guild.owner.user.id}>\nHi I'm CommandCleanup, a chat moderation bot designed to help keep guild sparkly clean by giving you **100%** control over the messages you can mass delete.\nIf you'd like to see the features and commands for this bot please use the link provided below and also consider giving the bot an upvote...\nhttps://discordbots.org/bot/420013638468894731`))
	
	let guildDetails = {
		name: guild.name,
		id: guild.id,
		owner: guild.owner.user.username,
		members: guild.memberCount,
		shard: client.shard.id
	}

	console.log(`the bot was added to, ${JSON.stringify(guildDetails)}`)
})

//client leave Guild Event
client.on('guildDelete', guild => {
	console.log(`the bot was removed from, { name:${guild.name}, id:${guild.id} }`)
	pool.getConnection((err, conn) => {
		if (conn) {
			conn.query(`SELECT * FROM guilds WHERE id = '${guild.id}'`, (err, rows) => {
				if (err) { 
					console.log(err.stack)
					pool.releaseConnection(conn)
				} else {
					if(rows.length > 0) {
						conn.query(`DELETE FROM guilds WHERE id = '${guild.id}'`, (err, rows) => {
							if (err) return console.log(err.stack)

							//database was deleted successfully
							console.log(`${guild.name}: deleted database entry`)
						})
						
					}
				}
				
				pool.releaseConnection(conn)
			})
		}
	})
})

//error and rate limiting handlers
client.on('error', (error) => {
	console.log(error.stack)
})

client.on('rateLimit', (object) => {
	if (object.path.match(/\/channels\/[0-9]\/messages\/bulk-delete/gi)) {
		console.log(object)
	}
})
