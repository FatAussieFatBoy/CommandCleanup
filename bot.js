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
	client.user.setActivity(`${client.guilds.size} servers! | Command: .cleanup`, {type: 'LISTENING'})
	
	console.log(`Logged in as ${client.user.username}!`)
	console.log(`Connected to ${client.guilds.size} servers`)
	
	client.setInterval(() => {
		dbl.postStats(client.guilds.size)
	}, 1800 * 1000)
})

//message event
client.on('message', message => {
	if (message.author.bot) return
	if (!message.content.startsWith(prefix)) return
	if (message.channel.type === 'dm') return message.author.send('This command can only be used inside of guilds')

	const args = message.content.split(/\s+/g)
	const command = args.shift().slice(prefix.length)
	const symbols = new RegExp(/^[-!$%^&()_+|~={}\[\]:";'?,.\/]/)
	
	switch(command.toLowerCase()) {
		case 'cleanup':
			if (message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
				switch(args[0]) {
					case 'commands': //all messages that begin with the most common symbols used in commands
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => symbols.test(msg.content) && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
							
							if(msgs.size === 0) return message.reply(`We could not find any messages. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs).catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break
			
					case 'bots': //all messages that are posted by bots
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.author.bot && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
							
							if(msgs.size === 0) return message.reply(`We could not find any messages. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs).catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break
						
					case 'all': //all past 100 messages
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
							
							if(msgs.size === 0) return message.reply(`We could not find any messages. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs).catch(err => console.log(err.stack))
						}).catch(err => console.log(err.stack))
						break
						
					case 'links': //all messages that start with http or https
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.content.startsWith('http://') || msg.content.startsWith('https://') && msg.id != message.id)
							
							if(msgs.size === 0) return message.reply(`We could not find any messages. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
								.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
							message.channel.bulkDelete(msgs).catch(err => console.log(err.stack))
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
											
											if(msgs.size === 0) return message.reply(`We could not find any messages. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
												.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
											message.channel.bulkDelete(msgs).catch(err => console.log(err.stack))
									}).catch(err => console.log(err.stack))
								})
							}
							
							if(mentioned_roles) {
								mentioned_roles.forEach((role, index) => {
									message.channel.fetchMessages({ limit: 100 })
										.then(messages => {
											let msgs = messages.filter(msg => msg.member.roles.exists('id', role.id) && msg.createdAt > new Date(Date.now() - 1.21e+9) && msg.id != message.id)
											
											if(msgs.size === 0) return message.reply(`We could not find any messages. ***NOTE:*** *The bot cannot delete any messages posted more than 14 days ago...*`)
												.then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
											message.channel.bulkDelete(msgs).catch(err => console.log(err.stack))
									}).catch(err => console.log(err.stack))
								})	
							}
						} else {
							message.reply(`Command Usage: *\`${prefix}cleanup (commands/bots/all/links/@user/@role)\`* | \`(required)\` \`<optional>\``).then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
						}
				}	
			} else {
				message.reply(`You have insufficient permissions to use this command`).then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))	
			}
			message.delete(0).catch(err => console.log(err.stack))
			break
			
		case 'guilds':
			console.log(`Servers that use CommandCleanup...`)
			client.guilds.array().forEach((guild, index) => {
				console.log(`Name:${guild.name} | ID:${guild.id} | Members:${guild.memberCount}`)
			})
			console.log(``)
	}
})

//Client join Guild Event
client.on('guildCreate', guild => {
	client.user.setActivity(`${client.guilds.size} servers! | Command: .cleanup`, {type: 'LISTENING'})
	console.log(`CommandCleanup was added to, Name:${guild.name} | ID:${guild.id} | Members:${guild.memberCount}`)
})

//Client leave Guild Event
client.on('guildDelete', guild => {
	client.user.setActivity(`${client.guilds.size} servers! | Command: .cleanup`, {type: 'LISTENING'})
	console.log(`CommandCleanup removed from, Name:${guild.name} | ID:${guild.id}`)
})

client.login(token)
