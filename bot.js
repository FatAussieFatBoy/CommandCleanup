const discord = require('discord.js')
const DBL = require('dblapi.js')
const request = require('request')

const client = new discord.Client({disableEveryone: true})
const dbl = new DBL(process.env.DBL_TOKEN)

const apiai = require('apiai')
const app = apiai(process.env.APIAI_TOKEN)

const token = process.env.TOKEN

//ready event
client.on('ready', () => {
	//set bot activity, post guilds.size to DBL & log the bot's client
	dbl.postStats(client.guilds.size)
	client.user.setActivity(`${client.guilds.size} servers!`, {type: 'LISTENING'})
	
	console.log(`Logged in as ${client.user.username}!`)
	console.log(`Connected to ${client.guilds.size} servers`)
})

//message event
client.on('message', message => {
	if (message.author.bot) return
	if (!message.mentions) return
	if (message.type === 'dm') return

	if (message.mentions.members.find('id', client.user.id)) {
		var quote = message.content.replace(/[^a-zA-Z'?,\s]/g, '')
		var task = app.textRequest(quote, {
			sessionId: 'chuck'
		})
		
		task.on('response', (response) => {

			var options = {
				method: 'GET',
				url: 'https://api.chucknorris.io/jokes/random'
			}
		
			request(options, (error, res, body) => {
				if(!error) {
					var json = JSON.parse(body)
					
					if (response.result.action === 'getjoke') return message.reply(json.value)
					message.reply(response.result.fulfillment.speech)
					
					console.log(`${quote} | ${response.result.fulfillment.speech}`)
				}
			})
		})
		
		task.on('error', (err) => {
			message.reply('Oops! There was an error...')
			console.log(err)
		})

		task.end()
	}
})

//Client join Guild Event
client.on('guildCreate', guild => {
	dbl.postStats(client.guilds.size)
	client.user.setActivity(`${client.guilds.size} servers!`, {type: 'LISTENING'})
	
	console.log(`Chuck Norris was added to, ${guild.name} | ${guild.id} | Large? ${guild.large}`)
})

//Client leave Guild Event
client.on('guildDelete', guild => {
	dbl.postStats(client.guilds.size)
	client.user.setActivity(`${client.guilds.size} servers!`, {type: 'LISTENING'})
	
	console.log(`Chuck Norris was removed from, ${guild.name} | ${guild.id} | Large? ${guild.large}`)
})

client.login(token)
