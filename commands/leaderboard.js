//dependencies
const utf8 = require('utf8')
const tools = require('./tools.js')

//leaderboard command
module.exports.run = async (client, prefix, message, args, pool) => {
	
	let ranks = [':trophy:', ':second_place:', ':third_place:', ':medal:', ':medal:']
	let str = ''

	console.log(`leaderboard requested by ${message.author.username}`)

	pool.getConnection((err, conn) => {
		if (err) {
			throw err
			pool.releaseConnection(conn)
		}

		if (conn) {
			let queryStr = message.channel.type != 'dm' ? `SELECT \`ranks\` . * FROM (SELECT @rownum := @rownum + 1 \`rank\`, p.name, p.messages_deleted, p.id FROM \`guilds\` p, (SELECT @rownum := 0) r ORDER BY \`messages_deleted\` DESC) \`ranks\` WHERE id = '${message.guild.id}' OR rank < 6` : `SELECT \`ranks\` . * FROM (SELECT @rownum := @rownum + 1 \`rank\`, p.name, p.messages_deleted, p.id FROM \`guilds\` p, (SELECT @rownum := 0) r ORDER BY \`messages_deleted\` DESC) \`ranks\` WHERE rank < 6`
			conn.query(`${queryStr}`, (err, rows) => {
				if (err) {
					throw err
					pool.releaseConnection(conn)
				}

				if (rows) {
					rows.forEach((row, index) => {
						let rank = parseInt(rows[index].rank) <= (parseInt(ranks.length)) ? ranks[parseInt(rows[index].rank) - 1] : `\`#${rows[index].rank}\``
						str += `\n${rank} - Guild \`${rows[index].name.replace('`', '')}\` with a total of \`${rows[index].messages_deleted}\` messages deleted.\n`
					})

					if (message.channel.type != 'dm') {
						//send the leaderboard to the first channel it has permission too
						tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n**--- CommandCleanup Leaderboard ---**\n${str}`, message.channel)
					} else {
						message.author.send(`**--- CommandCleanup Leaderboard ---**\n${str}`)
							.then(msg => tools.addDeleteReaction(msg))
							.catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n**--- CommandCleanup Leaderboard ---**\n${str}`, message.channel))
					}

					pool.releaseConnection(conn)
				} else {
					console.log(`ERROR: The database has no rows`)
					pool.releaseConnection(conn)
				}
			})
		}
	})

	if (message.deletable) message.delete(0).catch(err => console.log(err.stack)) //delete command message
}
