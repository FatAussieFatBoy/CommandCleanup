//dependencies
const discord = require('discord.js')
const fs = require('fs')
const tools = require('./tools.js')

//help command
module.exports.run = async (client, prefix, message, args, pool) => {
	const embed = new discord.RichEmbed()
		//set the embeds main title
		.setAuthor('CommandCleanup Help & Support')

		//set the bots colour
		.setColor(`#a0a0a0`)

		//add the description
		.setDescription(`Rather then pasting a huge load of ugly unformated text, I've provided you below with a list of links and useful facts that might help you resolve an issue or answer a question.\n\nIf your issue isn't resolved or your question isn't answered, then come stop by our [Support Server](https://discord.gg/Gkdbyeh) for further assistance.\n\u200B`)

		//add the timestamp to the bottom
		.setTimestamp(new Date())
		.setFooter(`This message will automatically delete after 5 minutes`)

	//add the information to the embed from the help.json
	let json = JSON.parse(fs.readFileSync('./jsons/help.json', 'utf8'))

	for (i in json) {
		embed.addField(`**${json[i].header}**`, `${json[i].body}\n\u200B`, false)
	}

	//send the completed embed to the user asking for it
	message.author.send('', embed)
	.then((msg) => {
		console.log(`help documentation requested by ${message.author.username}`)
		msg.delete(5 * 60 * 1000)
	})
	.catch((err) => {
		//send error message to the guild
		tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nPlease enable \`Allow direct messages from server members\` in your Privacy and Safety settings.`, message.channel)
	})

	if (message.deletable) message.delete(0).catch(err => console.log(err.stack)) //delete command message
}
