const discord = require('discord.js')
const DBL = require('dblapi.js')
const request = require('request')
const mysql = require('mysql')

const client = new discord.Client({disableEveryone: true})
const dbl = new DBL(process.env.DBL_TOKEN)

const token = process.env.TOKEN
const prefix = process.env.PREFIX

//ready event
client.on('ready', () => {
	//set clients activity to show server count
	client.user.setActivity(`.cleanup`, {type: 'LISTENING'})
	
	console.log(`Logged in as ${client.user.username}!`)
	console.log(`Connected to ${client.guilds.size} servers`)
	
	client.setInterval(() => {
		dbl.postStats(client.guilds.size)
		console.log(`Listening to ${client.guilds.size} servers!`)
	}, 1800 * 1000)
})

var con = mysql.createConnection({
	host: process.env.SQL_HOST,
	user: process.env.SQL_USER,
	password: process.env.SQL_PASS,
	database: process.env.SQL_DATABASE
})

con.connect(err => {
	if(err) console.log(err.stack)
	console.log(`Connected to database`)
})

function UpdateDeletedMessages(guild, msgCount) {
	con.query(`SELECT * FROM guilds WHERE id = '${guild.id}'`, (err, rows) => {
		if(err) console.log(err.stack)

		let sql
		
		if(rows.length < 1) {
			sql = `INSERT INTO guilds (id, member_count, messages_deleted) VALUES ('${guild.id}', ${guild.memberCount}, ${msgCount})`
			console.log(`Database table for guild ${guild.name} created`)
		} else {
			let messages_deleted = rows[0].messages_deleted
			sql = `UPDATE guilds SET messages_deleted = ${messages_deleted + msgCount} WHERE id = '${guild.id}'`
			console.log(`Database table for guild ${guild.name} updated`)
		}

		con.query(sql)
	})
}

client.on('message', message => {
	if (message.author.bot) return

	if (message.member) {
		if (!message.member.hasPermission('ADMINISTRATOR', false, true, true)) {
			if (/(?:https?:\/)?discord(?:app.com\/invite|.gg)/gi.test(message.content)) {
				message.delete(0)
				return
			}
		}
	}

	if (!message.content.startsWith(prefix)) return

	const args = message.content.split(/\s+/g)
	const command = args.shift().slice(prefix.length)
	const symbols = new RegExp(/[-!$%^&()_+|~={}\[\]:;?,.\/]/)
	
	switch(command.toLowerCase()) {
		case 'cleanup':
			if (message.channel.type === 'dm') return message.author.send('This command can only be used inside of guilds')
			if (message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
				var num
				if(args[0].match(/^\d+$/g)) {
					if(parseInt(args[0]) <= 100) {
						num = parseInt(args[0])
						args.shift()
					} else {
						message.author.send(`\`${args[0]}\` is too large, the bot can only delete a maximum of \`100\` messages at a time.`)
							.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
					}
				} else {
					num = 100
				}
				switch(args[0]) {
					case 'commands': //all messages that begin with the most common symbols used in commands
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => symbols.test(msg.content.substring(0, 2)) && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
							
							if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
								.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
								.catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break
			
					case 'bots': //all messages that are posted by bots
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.author.bot && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
							
							if(msgs.size === 0) return message.author.send(`We could not find any messages posted by bots inside channel \`${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
								.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
								.catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break
						
					case 'all': //all past 100 messages
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
							
							if(msgs.size === 0) return message.author.send(`We could not find any messages inside channel \`${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
								.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
								.catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break
						
					case 'links': //all messages that start with http or https
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.content.startsWith('http://') || msg.content.startsWith('https://') && msg.id != message.id)
							
							if(msgs.size === 0) return message.author.send(`We could not find any messages with links inside channel \`${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
								.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
								.catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break

					case 'attachments': //all messages with attachments (images, embeds)
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.attachments.size > 0 && msg.id != message.id)

							if(msgs.size === 0) return message.author.send(`We could not find any messages with attachments inside channel \`${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
								.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
								.catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break
						
					default: //see if message has mentions, if not give command usage.
						if (message.mentions) {
							let mentioned_users = message.mentions.users.array()
							let mentioned_roles = message.mentions.roles.array()
							
							if(mentioned_users) {
								mentioned_users.forEach((user, index) => {
									message.channel.fetchMessages({ limit: 100 })
										.then(messages => {
											let msgs = messages.filter(msg => msg.author.id === user.id && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
											
											if(msgs.size === 0) return message.author.send(`We could not find any messages from that user inside channel \`${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
												.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
											message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
												.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
												.catch(err => console.log(err.stack))
									}).catch(err => console.log(err.stack))
								})
							}
							
							if(mentioned_roles) {
								mentioned_roles.forEach((role, index) => {
									message.channel.fetchMessages({ limit: 100 })
										.then(messages => {
											let msgs = messages.filter(msg => msg.member.roles.exists('id', role.id) && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
											
											if(msgs.size === 0) return message.author.send(`We could not find any messages from that role inside channel \`${message.channel.name}\`.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`)
												.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
											message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
												.then(deleted_msgs => UpdateDeletedMessages(message.guild, deleted_msgs.size))
												.catch(err => console.log(err.stack))
									}).catch(err => console.log(err.stack))
								})	
							}
						} else {
							message.author.send(`Command Usage: *\`${prefix}cleanup <number of messages> (commands/bots/all/links/attachments/@user/@role)\`* | \`(required)\` \`<optional>\``).then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						}
				}
			} else {
				message.author.send(`You have insufficient permissions to use this command`).then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))	
			}
			message.delete(0).catch(err => console.log(err.stack))
			break

		case 'cleanedup':
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
			break

		case 'upvote':
			if (!dbl.hasVoted(`${message.author.id}`)) {
				message.author.send(`Enjoying the bot? You can upvote the bot here so more people can enjoy it aswell, https://discordbots.org/bot/420013638468894731/vote`)
			} else {
				message.author.send(`You have already upvoted the bot...`)
			}
	}
})

//Client join Guild Event
client.on('guildCreate', guild => {
	console.log(`CommandCleanup was added to, Name:${guild.name} | ID:${guild.id} | Members:${guild.memberCount}`)
})

//Client leave Guild Event
client.on('guildDelete', guild => {
	console.log(`CommandCleanup removed from, Name:${guild.name} | ID:${guild.id}`)
})

client.login(token)
