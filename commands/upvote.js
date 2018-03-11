//Upvote Command
module.exports.run = (client, prefix, message, args, con, dbl) => {
	if (!dbl.hasVoted(`${message.author.id}`)) {
		message.author.send(`Enjoying the bot? You can upvote the bot here so more people can enjoy it aswell, https://discordbots.org/bot/420013638468894731/vote`)
	} else {
		message.author.send(`You have already upvoted the bot...`)
	}
	if (message.channel.type != 'dm') message.delete(0).catch(err => console.log(err.stack))
}
