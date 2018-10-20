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
	let activities = ['.cleanup', 'https://commandcleanup.com', '.invite', '.leaderboard', `${client.guilds.size} servers!`]
	
	//set clients activity to show server count
	client.user.setActivity(`${activities[Math.floor(activities.length * Math.random())]}`, {type: 'LISTENING'})
	
	console.log(`Logged in as ${client.user.username}!`)
	console.log(`Connected to ${client.guilds.size} servers`)
	
	client.setInterval(() => {
		dbl.postStats(client.guilds.size)
		client.user.setActivity(`${activities[Math.floor(activities.length * Math.random())]}`, {type: 'LISTENING'})
	}, 1800 * 1000)
})

var options = {
	proxy: process.env.QUOTAGUARDSTATIC_URL,
	url: 'http://ip.jsontest.com/',
	headers: {'User-Agent': 'node.js'},
}

request(options, (error, response, body) => {
	if (!error && response.statusCode == 200) {
		console.log(body)
	}
})

var con = mysql.createConnection({
	host: process.env.SQL_HOST,
	user: process.env.SQL_USER,
	password: process.env.SQL_PASS,
	database: process.env.SQL_DATABASE
})

con.connect(err => {
	if(err) {
		console.log(err.stack)
	} else {
		console.log(`Connected to database`)
	}
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

//Client join Guild Event
client.on('guildCreate', guild => {
	guild.owner.send(`CommandCleanup has been added to your guild \`${guild.name}\`, if you'd like to see the features and commands for this bot please use the link provided below and also consider giving the bot an upvote...\nhttps://discordbots.org/bot/420013638468894731`)
	console.log(`CommandCleanup was added to, Name:${guild.name} | ID:${guild.id} | Members:${guild.memberCount}`)
})

//Client leave Guild Event
client.on('guildDelete', guild => {
	console.log(`CommandCleanup removed from, Name:${guild.name} | ID:${guild.id}`)
	con.query(`SELECT * FROM guilds WHERE id = '${guild.id}'`, (err, rows) => {
		if(err) { console.log(err.stack) } else {

			let sql
			
			if(rows.length > 0) {
				sql = `DELETE FROM guilds WHERE id = '${guild.id}'`
				console.log(`Database table for guild ${guild.name} deleted`)
				
				con.query(sql)
			}
		}
	})
})

client.login(token)
