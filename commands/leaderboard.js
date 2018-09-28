//Leaderboard Command
module.exports.run = async (client, prefix, message, args, con, dbl) => {
	
	let ranks = ['medal', 'trophy', 'second_place', 'third_place', 'medal', 'medal']

	con.query(`SELECT * FROM guilds ORDER BY messages_deleted DESC LIMIT 5`, (err, rows) => {
		if(err) console.log(err.stack)
		if(!rows) return console.log(`ERROR: The database has no rows`)

		let str = ''
		rows.forEach((row, index) => {
			str += `\n:${ranks[index + 1]}: - Guild \`${rows[index].name}\` with a total of \`${rows[index].messages_deleted}\` messages deleted.\n`
		})
		
		message.author.send(`**--- CommandCleanup Leaderboard ---**\n${str}`)
			.then(msg => msg.delete(30 * 1000))
			.catch(err => console.log(err.stack))
	})
	
	if (message.channel.type != 'dm') {
		
		//Display Server Ranking
		con.query("SELECT *, FIND_IN_SET( `messages_deleted`, (SELECT GROUP_CONCAT( `messages_deleted` ORDER BY `messages_deleted` DESC ) FROM `guilds` )) AS `rank` FROM `guilds` WHERE `id` = ${message.guild.id}", (err, rows) => {
			if(err) console.log(err.stack)
			if(!rows) return console.log(`ERROR: The database has no rows`)
	
			let str = ''
			rows.forEach((row, index) => {
				str += `\n${ (rows[index].rank - 1) > ranks.length ? rows[index].rank : ranks[ row[index].rank ] } - Guild \`${rows[index].name}\` has a total of \`${rows[index].messages_deleted}\` messages deleted and\n`
			})
			
			message.author.send(`${str}`)
				.then(msg => msg.delete(30 * 1000))
				.catch(err => console.log(err.stack))
		})
		
		if (message.channel.permissionsFor(message.guild.member(client.user)).has('MANAGE_MESSAGES')) {
			message.delete(0).catch(err => console.log(err.stack))
		}
	}
}
