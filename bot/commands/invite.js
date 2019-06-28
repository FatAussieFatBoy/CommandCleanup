module.exports.run = (client, message) => {
	
	/*
		generate an invite link, send it to the requesting
		user and log the invite request
	*/

	client.generateInvite(['SEND_MESSAGES', 'MANAGE_MESSAGES']).then((link) => {
		message.author.send(`Hi there, thanks for considering to add **${client.user.username}** to your discord server!\nHere is an invite link, ${link}`)
	})
}

exports.config = {
	enabled: true,
	guildOnly: false,
	aliases: ['inv']
}

exports.help = {
	name: 'invite',
	category: 'General',
	description: "Get an invite link to add the CommandCleanup bot to your discord.",
	usage: 'invite'
}