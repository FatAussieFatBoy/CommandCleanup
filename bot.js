const discord = require('discord.js')
const request = require('request')

const client = new discord.Client({disableEveryone: true})
const token = process.env.TOKEN
const prefix = process.env.PREFIX

var deleted_messages = 0

//ready event
client.on('ready', () => {
	//set clients activity to show server count
	client.user.setActivity(`${client.guilds.size} servers!`, {type: 'LISTENING'})
	
	console.log(`Logged in as ${client.user.username}!`)
	console.log(`Connected to ${client.guilds.size} servers`)
	
	client.setInterval(() => {
		console.log(`${deleted_messages} messages deleted this session...`)
	}, 600 * 1000)
})

//message event
client.on('message', message => {
	if (message.author.bot) return
	if (!message.content.startsWith(prefix)) return
	if (message.type === 'dm') return

	const args = message.content.split(/\s+/g)
	const command = args.shift().slice(prefix.length)
	const symbols = new RegExp(/^[-!$%^&()_+|~={}\[\]:";'?,.\/]/)
	
	switch(command) {
		case 'cleanup':
			if (message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
				switch(args[0]) {
					case 'commands': //all messages that begin with the most common symbols used in commands
						message.edit(`Removing Commands...`)
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.content.startsWith(symbols))
							message.channel.bulkDelete(msgs)
						}).catch(err => console.log(err.stack))
						break
			
					case 'bots': //all messages that are posted by bots
						message.edit(`Removing Bot Messages...`)
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							let msgs = messages.filter(msg => msg.author.bot)
							message.channel.bulkDelete(msgs)
						}).catch(err => console.log(err.stack))
						break
						
					case 'all': //all past 100 messages
						message.edit(`Removing All Messages...`)
						message.channel.fetchMessages({ limit: 100 })
						.then(messages => {
							message.channel.bulkDelete(messages)
						}).catch(err => console.log(err.stack))
						break
						
					case user: //mentioned user(s)
						let mentioned = message.mentions.users.array()
						mentioned.forEach((user, index) => {
							message.edit(`Removing Messages for member ${user.username}...`)
							message.channel.fetchMessages({ limit: 100 })
								.then(messages => {
								let msgs = messages.filter(msg => msg.author.id === user.id)
								message.channel.bulkDelete(msgs)
							}).catch(err => console.log(err.stack))
						})
						break
						
					default: //reply with possible commands
						message.reply(`Command Usage: *\`${prefix}cleanup (commands/@mention/bots/all)\`* | \`(required)\` \`<optional>\``).then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))
				}	
			} else {
				message.reply(`You have insufficient permissions to use this command`).then(msg => msg.delete(10 * 1000)).catch(err => console.log(err.stack))	
			}
			message.delete(0)
			break
	}
})

//Client join Guild Event
client.on('guildCreate', guild => {
	client.user.setActivity(`${client.guilds.size} servers!`, {type: 'LISTENING'})
	console.log(`CommandCleanup was added to, ${guild.name} | ${guild.id} | Large? ${guild.large}`)
})

//Client leave Guild Event
client.on('guildDelete', guild => {
	client.user.setActivity(`${client.guilds.size} servers!`, {type: 'LISTENING'})
	console.log(`CommandCleanup removed from, ${guild.name} | ${guild.id} | Large? ${guild.large}`)
})

client.login(token)
