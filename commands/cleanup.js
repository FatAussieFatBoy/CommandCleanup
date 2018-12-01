//require functions so they can be called
const tools = require('./tools.js')

//Cleanup Command
module.exports.run = async (client, prefix, message, args, pool) => {

	if (message.channel.type === 'dm') 
		return message.author.send('This command can only be used inside of guilds.')

	const clientMember = message.guild.member(client.user)
	const messageMember = message.guild.member(message.author)

	if (!clientMember.permissionsIn(message.channel).has('MANAGE_MESSAGES', true)) {
		return message.author.send(`I do not have permission to delete messages in \`#${message.channel.name}\`...\nIf you believe this is incorrect then please ensure the channels permissions allow CommandCleanup to \`MANAGE_MESSAGES\`.`)
			.then(msg => tools.addDeleteReaction(msg)).catch(err => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nI do not have permission to delete messages in \`#${message.channel.name}\`...\nIf you believe this is incorrect then please ensure the channels permissions allow CommandCleanup to \`MANAGE_MESSAGES\`.`, message.channel))
	}
		
	if (!messageMember.permissionsIn(message.channel).has('MANAGE_MESSAGES', true)) {
		return message.author.send(`You have insufficient permissions to use that command in \`#${message.channel.name}\``)
			.then(msg => tools.addDeleteReaction(msg)).catch(err => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nYou have insufficient permissions to use that command in \`#${message.channel.name}\``, message.channel))
	}

	let information = {
		sqlPool: pool,
		date_limit: new Date().getTime() - (14 * 24 * 60 * 60 * 1000), //set 14 day limit as default

		num: 100, //set number to 100 as default
		isValid: true, //set the valid check to true by default

		//command parameters
		options: {},
		filters: [],
		mentions: [],
		channels: []
	}

	let symbolsRegExp = new RegExp(/^.{0,3}([a-z])[-!$%^&()_+|~={}\[\]:;?,.\/]|^.{0,3}[-!$%^&()_+|~={}\[\]:;?,.\/]|^.{0,3}[-!$%^&()_+|~={}\[\]:;?,.\/]([a-z])/gi)
	let linkRegExp = new RegExp(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm)

	//change number if option exists
	if (args.length > 0) {
		//log all arguments to the console for debug purposes
		console.log(`${message.guild}: ${JSON.stringify(args)}`)

		//create errors array for validation after the loop has completed
		let errors = []

		//loop through arguments to set command parameters
		tools.asyncForEach(args, (arg, index) => {
			let option = arg.startsWith('-') ? arg.slice(1) : arg

			let nextIndex = parseInt(index) + 1
			let prevIndex = parseInt(index) - 1

			switch (option) {
				//fetchMessages() filter
				case 'before':
					//check if the value is a number
					if (args[nextIndex] && args[nextIndex].match(/^[0-9]+$/g)) {
						//define the before variable in the fetchMessages() options
						information.options['before'] = `${args[nextIndex]}`
						args.splice(nextIndex, 1)
					} else {
						let errorMsg = args[nextIndex] ? `\`${args[nextIndex]}\` is not a valid message id, message id's should only contain numbers. Please ensure your message id is correct next time you use the \`${option}\` parameter..` : `No argument was found after the \`${option}\` parameter, please provide the message id of the message you wish to target.`
						return message.author.send(`${errorMsg}`)
							.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n${errorMsg}`, message.channel))
					}
		
					break

				//fetchMessages() filter
				case 'after':
					//check if the value is a number
					if (args[nextIndex] && args[nextIndex].match(/^[0-9]+$/g)) {
						//define the after variable in the fetchMessages() options
						information.options['after'] = `${args[nextIndex]}`
						args.splice(nextIndex, 1)
					} else {
						let errorMsg = args[nextIndex] ? `\`${args[nextIndex]}\` is not a valid message id, message id's should only contain numbers. Please ensure your message id is correct next time you use the \`${option}\` parameter..` : `No argument was found after the \`${option}\` parameter, please provide the message id of the message you wish to target.`
						return message.author.send(`${errorMsg}`)
							.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n${errorMsg}`, message.channel))
					}
		
					break

				//fetchMessages() filter
				case 'around':
					//check if the value is a number
					if (args[nextIndex] && args[nextIndex].match(/^[0-9]+$/g)) {
						//define the around variable in the fetchMessages() options
						information.options['around'] = `${args[nextIndex]}`
						args.splice(nextIndex, 1)
					} else {
						let errorMsg = args[nextIndex] ? `\`${args[nextIndex]}\` is not a valid message id, message id's should only contain numbers. Please ensure your message id is correct next time you use the \`${option}\` parameter..` : `No argument was found after the \`${option}\` parameter, please provide the message id of the message you wish to target.`
						return message.author.send(`${errorMsg}`)
							.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n${errorMsg}`, message.channel))
					}
		
					break

				case 'datelimit':
					//check if the value is a number that ends with a letter
					if (args[nextIndex] && args[nextIndex].match(/^[0-9]*[a-z]$/gi)) {
						
						//set the datelimit values
						let stringValue = args[nextIndex].replace(/[0-9]/g, '')
						let numericValue = parseInt(args[nextIndex].replace(/[a-z]/gi, ''))

						switch(stringValue) {
							/* set the date limit to be handled in years
							case 'y':
							case 'year':
							case 'years':
								if (numericValue > 1) {
									message.author.send(`\`${numericValue}\` is too big, the maximum number of years we can delete messages up to is \`1\` year`)
										.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n\`${numericValue}\` is too big, the maximum number of days we can delete messages up to is \`30\` days`, message.channel))
									args.splice(nextIndex, 1)
									break
								}

								information.date_limit = new Date().getTime() - (numericValue * 365 * 24 * 60 * 60 * 1000)
								// years * days/year * hours/day * minutes/hour * seconds/minute * milliseconds/second
								
								args.splice(nextIndex, 1)
								break

							*/

							//set the date limit to be handled in days
							case 'd':
							case 'day':
							case 'days':
								//make sure the date limit isn't above 14 days
								if (numericValue > 14) {
									args.splice(nextIndex, 1)
									return message.author.send(`\`${numericValue}\` is too big, the maximum number of days we can delete messages up to is \`14\` days`)
										.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n\`${numericValue}\` is too big, the maximum number of days we can delete messages up to is \`30\` days`, message.channel))
								}

								information.date_limit = new Date().getTime() - (numericValue * 24 * 60 * 60 * 1000)
								// days * hours/day * minutes/hour * seconds/minute * milliseconds/second
								
								args.splice(nextIndex, 1)
								break

							//set the date limit to be handled in hours
							case 'h':
							case 'hour':
							case 'hours':
								//make sure the date limit isn't above 14 days
								if (numericValue > (14 * 24)) {
									args.splice(nextIndex, 1)
									return message.author.send(`\`${numericValue}\` is too big, the maximum number of hours we can delete messages up to is \`${parseInt(14*24)}\` hours`)
										.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n\`${numericValue}\` is too big, the maximum number of hours we can delete messages up to is \`720\` hours`, message.channel))
								}

								information.date_limit = new Date().getTime() - (numericValue * 60 * 60 * 1000)
								// hours * minutes/hour * seconds/minute * milliseconds/second
								
								args.splice(nextIndex, 1)
								break

							//set the date limit to be handled in minutes
							case 'm':
							case 'minute':
							case 'minutes':
								//make sure the date limit isn't above 14 days
								if (numericValue > (14 * 24 * 60)) {
									args.splice(nextIndex, 1)
									return message.author.send(`\`${numericValue}\` is too big, the maximum number of minutes we can delete messages up to is \`${parseInt(14*24*60)}\` minutes`)
										.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n\`${numericValue}\` is too big, the maximum number of minutes we can delete messages up to is \`43200\` minutes`, message.channel))
								}

								information.date_limit = new Date().getTime() - (numericValue * 60 * 1000)
								// minutes * seconds/minute * milliseconds/second

								args.splice(nextIndex, 1)
								break

							//invalid time extension string
							default:
								return message.author.send(`\`${stringValue}\` is not a valid extension.\nValid extensions: \`(d)ays\`, \`(h)ours\` and \`(m)inutes\``) 
									.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n\`${stringValue}\` is not a valid extension.\nValid extensions: \`(d)ays\`, \`(h)ours\` and \`(m)inutes\``, message.channel))
						}

						break	
					} else {
						let errorMsg = args[nextIndex] ? `\`${args[nextIndex]}\` is not a valid time frame, time frames should be a number followed by the time extension letter \`D = days, H = hours, M = minutes\`. Please ensure your time frame is correct next time you use the \`${option}\` parameter..` : `No argument was found after the \`${option}\` parameter, please provide the time frame you want to target.\nTime frames should consist of a number followed by the time extension letter \`D = days, H = hours, M = minutes\``
						return message.author.send(`${errorMsg}`)
							.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n${errorMsg}`, message.channel))
					}

					break

				//channel filter
				case 'channels':
				case 'channel':
				case 'chnls':
				case 'chnl':
					//check if the value is a channel mention or the word all
					if (args[nextIndex] && args[nextIndex].match(/all|<#([0-9]+)>/gi)) {
						//check if the value was the word all
						if (args[nextIndex] === 'all') {
							//add all guild channels to the channels array
							message.guild.channels.forEach((channel, index) => {
								information.channels.push(channel.id)
							})
						} else {
							//create a list of possible variables that could be channel mentions
							let possibleChnls = args.slice(parseInt(index) + 1)

							possibleChnls.some((value, index) => {
								//check if the value is a channel mention and stop the array if it isn't
								if (!value.match(/<#([0-9]+)>/gi)) {
									return true
								}

								//replace the mention to only contain the id of the channel
								let id = value.replace(/[^0-9]+/gi, '')

								/*
									check if the array already has that channel added
									if not add it to the array
								*/

								if (!information.channels.includes(id)) information.channels.push(id)

								//remove the value for the list of args
								args.splice(nextIndex, 1)
							})
						}
					} else {
						let errorMsg = args[nextIndex] ? `\`${args[nextIndex]}\` is not a valid channel mention. Please ensure you mention any channel(s) you want to target next time you use the \`${option}\` parameter..` : `No argument was found after the \`${option}\` parameter, please provide a channel mention of the channel(s) you want to target.`
						return message.author.send(`${errorMsg}`)
							.then((msg) => tools.addDeleteReaction(msg)).catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n${errorMsg}`, message.channel))
					}

					break

				//attachments filter
				case 'attachments':
				case 'attachment':
					information.filters.push(`(msg.attachments.size > 0)`)
					break

				//text filter
				case 'text':
				case 'txt':
					information.filters.push(`(msg.attachments.size < 1 && !msg.content.match(${linkRegExp}))`)
					break

				//commands filter
				case 'commands':
				case 'command':
				case 'cmds':
				case 'cmd':
					//create a list of possible variables that could be commands
					let possibleCmds = args.slice(parseInt(index) + 1)

					//create the commands array
					let cmds = []

					if (possibleCmds.length < 1) {
						//add the basic cmd checker to the message.filter array
						information.filters.push(`(msg.content.match(${symbolsRegExp}))`)
						break
					}

					possibleCmds.some((value, index) => {
						//check if the value is not a cmd and stop the array if it isn't
						if (!value.match(symbolsRegExp)) return true

						//add the cmd to the array and continue to the next value
						cmds.push(value)

						//remove the value for the list of args
						args.splice(nextIndex, 1)
					})

					//check if there are any valid cmds
					if (cmds.length < 1) {
						//add the basic cmd checker to the message.filter array
						information.filters.push(`(msg.content.match(${symbolsRegExp}))`)
						break
					}

					//loop through cmds and add them to the filter
					cmds.forEach((cmd, index) => {
						information.filters.push(`(msg.content.startsWith("${cmd}"))`)
					})
					
					break

				//bots filter
				case 'bots':
				case 'bot':
					information.filters.push(`(msg.author.bot)`)
					break

				//links filter
				case 'links':
				case 'link':
					//create a list of possible variables that could be links
					let possibleLinks = args.slice(parseInt(index) + 1)

					//create the links array
					let links = []

					//check if there aren't any following values to the parameter
					if (possibleLinks.length < 1) {
						//add the basic link checker to the message.filter array
						information.filters.push(`(msg.content.match(${linkRegExp}))`)
						break
					}

					//loop through possible values and get all links
					possibleLinks.some((value, index) => {
						//check if the value is not a link and stop the array if it isn't
						if (!value.match(linkRegExp)) return true

						//add the link to the array and continue to next value
						links.push(value)

						//remove the value for the list of args
						args.splice(nextIndex, 1)
					})

					//check if there are any valid links
					if (links.length < 1) {
						//add the basic link checker to the message.filter array
						information.filters.push(`(msg.content.match(${linkRegExp}))`)
						break
					}

					//loop through links and add them to the filter
					links.forEach((link) => {
						information.filters.push(`(msg.content.includes("${link}"))`)
					})
														
					break

				//purge filter
				case 'purge':
					information.filters.push(`(!msg.guild.members.has(msg.author.id))`)
					break

				//all filter
				case 'all':
					//handle the all parameter but do nothing with it
					break

				//mentions and number filter
				default:
					//check if the mention is for a user
					if (option.match(/<@!?[0-9]+>/g)) {
						let user = message.client.users.get(option.replace(/[<@&#>]/g, ''))

						if (user) { //check if the user can be found by the bot client
							information.mentions.push(`(msg.author.id === '${user.id}')`)
						} else {
							message.author.send(`The user with id \`${option}\` cannot be found, if this user has left, been kicked or banned from the guild please use \`.purge\` instead.`)
								.then(msg => tools.addDeleteReaction(msg))
								.catch(err => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nThe user with id \`${option}\` cannot be found, if this user has left, been kicked or banned from the guild please use \`.purge\` instead.`, message.channel))
						}
					
					//check if the mention is for a role
					} else if (option.match(/<@&[0-9]+>/g)) {
						let role = message.guild.roles.get(option.replace(/[<@&#>]/g, ''))

						if (role) { //check if the role can be found in the guild
							information.mentions.push(`(msg.member.roles.has('${role.id}'))`)
						} else {
							message.author.send(`The role with id \`${option}\` cannot be found on the guild.`)
								.then(msg => tools.addDeleteReaction(msg))
								.catch(err => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nThe role with id \`${option}\` cannot be found on the guild.`, message.channel))
						}

					//option is a number but has no parameter before it
					} else if (option.match(/^[0-9]+$/g)) {
						//see if the number is below 100
						if (parseInt(option) <= 100) {
							information.num = parseInt(option)
						} else {
							message.author.send(`\`${option}\` is too large, the bot can delete a maximum of \`100\` messages at a time..`)
								.then(msg => tools.addDeleteReaction(msg))
								.catch(err => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n\`${option}\` is too large, the bot can delete a maximum of \`100\` messages at a time..`, message.channel))
						}
					
					//couldn't find any valid matches to this parameter
					} else {
						errors.push(`${option}`)
					}
			}
		}, () => {
			if (errors.length > 0) {
				console.log(`errors found: ${errors.join(', ')}`)
				return message.author.send(`${errors.length > 1 ? `\`${errors.join(', ')}\` are not valid command parameters.` : `\`${errors[0]}\` is not a valid command parameter.`}\nAvailable parameters: \`number/num <#>\` \`before/after/around <message id>\` \`attachments/text/links/commands/bots/all/@user/@role\``)
					.then((msg) => tools.addDeleteReaction(msg))
					.catch(err => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\n${errors.length > 1 ? `\`${errors.join(', ')}\` are not valid command parameters.` : `\`${errors[0]}\` is not a valid command parameter.`}\nA list of available parameters can be found on our discordbots.org site;\nhttps://discordbots.org/bot/420013638468894731`, message.channel))
			}

			deleteMessages(message, information, client)
		})
	} else {
		//no arguments found, delete all messages
		deleteMessages(message, information, client)
	}

	if (message.deletable) message.delete(0).catch(err => console.log(err.stack)) //delete command message
}

function deleteMessages(message, map, client) {
	//set the client and author member variables
	const clientMember = message.guild.member(client.user)
	const messageMember = message.guild.member(message.author)

	//check if no channels have been defined to target
	if (map.channels.length < 1) map.channels.push(message.channel.id)

	//loop through all channels in the array
	map.channels.forEach((id, index) => {
		//check if the channel exists
		if (!message.guild.channels.has(id)) return

		//set the channel variable
		let channel = message.guild.channels.get(id)

		//check if the client and author can manage messages in the channel
		if (!clientMember.permissionsIn(channel).has(9216, true) || !messageMember.permissionsIn(channel).has(9216, true)) return

		//check if the channel is a text channel
		if (channel.type != 'text') return

		//fetch messages and delete them from the channel
		channel.fetchMessages(map.options)
			.then((messages) => {
				//no messages could be found
				if (!messages) return message.author.send(`Can't find any messages in \`#${channel.name}\` matching your command parameters`)
					.then((msg) => tools.addDeleteReaction(msg))
					.catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nCan't find any messages in <#${channel.id}> matching your command parameters`, message.channel))

				//filter through fetched messages with the filter options
				let filters = `((!msg.pinned && msg.id != message.id && msg.createdTimestamp >= ${map.date_limit} && msg.deletable)`
				//add mentions if they exist
				filters = map.mentions.length > 0 ? `${filters} && ${map.mentions.join(' || ')}` : `${filters}`
				//add extra filters to the array
				filters = map.filters.length > 0 ? `${filters} && ${map.filters.join(' || ')})` : `${filters})`
				//filter the messages
				let msgs = messages.filter((msg) => eval(filters)) //I know eval is ev-i-l but I couldn't find any other solution

				//no messages matched the filter
				if(msgs.size === 0) return message.author.send(`Hmm, I couldn't find any messages in \`#${channel.name}\` matching your command parameters.`)
					.then((msg) => tools.addDeleteReaction(msg))
					.catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nHmm, I couldn't find any messages in <#${channel.id}> matching your command parameters.\n***NOTE:*** *The bot cannot delete any messages posted more than 14 days old...*`, message.channel))

				channel.bulkDelete(msgs.first(map.num), true) //delete all messages as a bulk delete
					.then(deleted_msgs => {
						//update mySQL with the newly deleted messages count
						tools.updateDeletedMessages(message.guild, deleted_msgs.size, map.sqlPool)
					}).catch(err => { 
						console.log(err.stack);
						return message.author.send(`I cannot delete messages right now.. Please notify the bot creator`)
							.then((msg) => tools.addDeleteReaction(msg))
							.catch((err) => tools.sendMessageToGuild(client, message.guild, `<@${message.author.id}>\nI cannot delete messages right now.. Please notify the bot creator`, message.channel))
					})

			}).catch((err) => console.log(err.stack))
		})
}
