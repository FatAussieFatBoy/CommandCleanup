const discord = require('discord.js')
const request = require('request')
const mysql = require('mysql')

const client = new discord.Client({disableEveryone: true})

const token = process.env.TOKEN
const prefix = process.env.PREFIX

//ready event
client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}!`)
})

client.on('message', async message => {
	if (message.channel.type != 'dm') {
		if (message.guild.member(client.user)) {
			let user = message.guild.member(client.user)
			if (message.channel.permissionsFor(user).has('MANAGE_MESSAGES')) {
				if (/(?:https:?\/)?discord(?:app.com\/invite|.gg)/gi.test(message.content)) {
					let msgUser = message.guild.member(message.author)
					if (!msgUser.hasPermission('ADMINISTRATOR', false, true, true)) {
					    	message.delete(0).catch(err => console.log(err.stack))
					    	return
					}
				}
			}
		}
	}
	
	if (!message.content.startsWith(prefix)) return

	const args = message.content.split(/\s+/g)
	const command = args.shift().slice(prefix.length)

	try {
		let cmdFile = require(`./commands/${command.toLowerCase()}.js`)
		cmdFile.run(client, prefix, message, args, con, dbl)
	} catch (err) {
		//console.log(err.stack) when debugging
	}

})

client.login(token)
