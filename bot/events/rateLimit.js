module.exports = async (client, object) => {
	client.emit('warn', `DiscordAPI has hit a ratelimit,\n${JSON.stringify(object, 2, null)}`)
}