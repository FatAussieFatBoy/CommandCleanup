const discord = require('discord.js')
const DBL = require('dblapi.js')
const request = require('request')

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

//message event
client.on('message', message => {
	if (message.author.bot) return
	if (!message.content.startsWith(prefix)) return
	if (message.channel.type === 'dm') return message.author.send('This command can only be used inside of guilds')

	const args = message.content.split(/\s+/g)
	const command = args.shift().slice(prefix.length)
	const symbols = new RegExp(/[-!$%^&()_+|~={}\[\]:;?,.\/]/)
	
	switch(command.toLowerCase()) {
		case 'cleanup':
			if(args.length > 0) {
				if (message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
					var num
					if(args[0].match(/^\d+$/g)) {
						if(parseInt(args[0]) <= 1000) {
							num = parseInt(args[0])
							args.shift()
						} else {
							message.author.send(`\`${args[0]}\` is too large, the bot can only delete a maximum of \`1000\` messages at a time.`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						}
					} else {
						num = 1000
					}
					switch(args[0]) {
						case 'commands': //all messages that begin with the most common symbols used in commands
							message.channel.fetchMessages({ limit: 1000 })
							.then(messages => {
								let msgs = messages.filter(msg => symbols.test(msg.content.substr(0, 2)) && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
								
								if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
									.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
								message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
							}).catch(err => console.log(err.stack))
							break
				
						case 'bots': //all messages that are posted by bots
							message.channel.fetchMessages({ limit: 1000 })
							.then(messages => {
								let msgs = messages.filter(msg => msg.author.bot && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
								
								if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
									.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
								message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
							}).catch(err => console.log(err.stack))
							break
							
						case 'all': //all past 100 messages
							message.channel.fetchMessages({ limit: 1000 })
							.then(messages => {
								let msgs = messages.filter(msg => msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
								
								if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
									.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
								message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
							}).catch(err => console.log(err.stack))
							break
							
						case 'links': //all messages that start with http or https
							message.channel.fetchMessages({ limit: 1000 })
							.then(messages => {
								let msgs = messages.filter(msg => msg.content.includes('http://') || msg.content.includes('https://') && msg.id != message.id)
								
								if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
									.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
								message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
							}).catch(err => console.log(err.stack))
							break
							
						case 'attachments': //all messages with attachments (images, embeds)
							message.channel.fetchMessages({ limit: 1000 })
							.then(messages => {
								let msgs = messages.filter(msg => msg.attachments.size > 0 && msg.id != message.id)
	
								if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
									.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
								message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
							}).catch(err => console.log(err.stack))
							break
							
						default: //see if message has mentions, if not give command usage.
							if (message.mentions) {
								let mentioned_users = message.mentions.users.array()
								let mentioned_roles = message.mentions.roles.array()
								
								if(mentioned_users) {
									mentioned_users.forEach((user, index) => {
										message.channel.fetchMessages({ limit: 1000 })
											.then(messages => {
												let msgs = messages.filter(msg => msg.author.id === user.id && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
												
												if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
													.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
												message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
										}).catch(err => console.log(err.stack))
									})
								}
								
								if(mentioned_roles) {
									mentioned_roles.forEach((role, index) => {
										message.channel.fetchMessages({ limit: 1000 })
											.then(messages => {
												let msgs = messages.filter(msg => msg.member.roles.exists('id', role.id) && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
												
												if(msgs.size === 0) return message.author.send(`We could not find any command messages inside channel \`${message.channel.name}\`. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
													.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
												message.channel.bulkDelete(msgs.first(num)).catch(err => console.log(err.stack))
										}).catch(err => console.log(err.stack))
									})	
								}
							} else {
								message.author.send(`Command Usage: *\`${prefix}cleanup <number of messages> (commands/bots/all/links/attachments/@user/@role)\`* | \`(required)\` \`<optional>\``).catch(err => console.log(err.stack))
							}
					}	
				} else {
					message.author.send(`You have insufficient permissions to use this command`).catch(err => console.log(err.stack))	
				}
				message.delete(0).catch(err => console.log(err.stack))
				break
			} else {
				message.author.send(`Command Usage: *\`${prefix}cleanup <number of messages> (commands/bots/all/links/attachments/@user/@role)\`* | \`(required)\` \`<optional>\``).catch(err => console.log(err.stack))	
			}
		break
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
