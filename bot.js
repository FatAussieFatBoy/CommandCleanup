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
	}, 1800 * 1000)
})

var con = mysql.createConnection({
	host: process.env.SQL_HOST,
	user: process.env.SQL_USER,
	password: process.env.SQL_PASS,
	database: process.env.SQL_DATABASE,
	port: process.env.SQL_PORT
})

con.connect(err => {
	if(err) console.log(err.stack)
	console.log(`Connected to database`)
})

client.on('message', async message => {
	if (message.channel.type != 'dm') {
		if (message.channel.permissionsFor(message.guild.member(client.user)).has('MANAGE_MESSAGES')) {
			if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR', false, true, true)) {
			    	if (/(?:https:?\/)?discord(?:app.com\/invite|.gg)/gi.test(message.content)) {
				    	message.delete(0).catch(err => console.log(err.stack))
				    	return
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
		console.log(`cmdFile, ${command.toLowerCase()}.js does not exist`)
	}

})

//Client join Guild Event
client.on('guildCreate', guild => {
	guild.owner.send(`CommandCleanup has been added to your guild \`${guild.name}\`, if you'd like to see the features and commands for this bot please use the link provided below and also consider giving the bot an upvote...\nhttps://discordbots.org/bot/420013638468894731`)
	console.log(`CommandCleanup was added to, Name:${guild.name} | ID:${guild.id} | Members:${guild.memberCount}`)
})

//Client leave Guild Event
client.on('guildDelete', guild => {
	console.log(`CommandCleanup removed from, Name:${guild.name} | ID:${guild.id}`)
})

client.login(token)
