const discord = require('discord.js')
const request = require('request')

const client = new discord.Client({disableEveryone: true})
const token = process.env.TOKEN

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
	if (!message.mentions) return
	if (message.type === 'dm') return

	const args = message.content.split(/\s+/g)
	const symbols = new RegExp(/^[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/)

	switch(args[0]) {
		case '.cleanupcommands':
			message.channel.fetchMessages({ limit: 100 })
			.then(msgs => {
				msgs.forEach((msg, index) => {
					const words = msg.content.split(/\s+/g)
					if (symbols.test(words[0])) {
						msg.delete(0).then(() => deleted_messages++).catch(err => console.log(err.stack))
					}
				})
			}).catch(err => console.log(err.stack))
			break

		default:
			if (symbols.test(args[0])) {
				message.delete(2 * 1000).then(() => deleted_messages++).catch(err => console.log(err.stack))
			}
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
