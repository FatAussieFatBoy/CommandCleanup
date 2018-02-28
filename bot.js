const discord = require('discord.js')
const request = require('request')

const client = new discord.Client({disableEveryone: true})

const apiai = require('apiai')
const app = apiai(process.env.APIAI_TOKEN)

const token = process.env.TOKEN

//ready event
client.on('ready', () => {
	//set bot activity & log the bot's client	
	client.user.setActivity(`${client.guilds.length} servers!`, {type: 'LISTENING'})
	console.log(`Logged in as ${client.user.username}!`)
})

//message event
client.on('message', message => {
	if (message.author.bot) return
	if (!message.mentions) return

	if (message.mentions.members.find('id', client.user.id)) {
		var quote = message.content.replace(client.user.id, '')
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

client.login(token)
