const { Structures } = require('discord.js')
const Filters = require('../utils/Filters')
const Exps = require('../utils/RegExpressions')

module.exports = Structures.extend('Message', Message => {
	class CleanupMessage extends Message {
		constructor(...args) {
			super(...args)
		}

		async run() {
			/* fetch the member if it doesn't already exist */
			if (this.channel.type == 'text' && !this.guild.members.has(this.author.id) && !this.webhookID) {
				this.member = await this.guild.members.fetch(this.author)
			}

			/* fetch the clients member if it doesn't already exist */
			if (this.channel.type == 'text' && !this.guild.members.has(this.client.user.id)) {
				await this.guild.members.fetch(this.client.user.id)
			}
		}

		/* cleanup functions */
		matches(filters, options) {
			const containsLink = Boolean(this.content.match(Exps.links))
			const containsCommand = Boolean(this.content.match(Exps.symbols))
			const containsFiles = Boolean(this.attachments && this.attachments.size > 0)
			const containsEmbed = Boolean(this.embeds && this.embeds.length > 0)

			if (options instanceof Object) {
				if (options['command'] && (this.id == (options.command.id || options.command))) return false
				
				if (options['datelimit'] && parseInt(options['datelimit']))
					if (this.createdTimestamp < options['datelimit']) return false
			
				if (options['mentions'] && options['mentions'].length > 0) {
					if (options['mentions'].includes('bots') && !this.author.bot) return false
					if (options['mentions'].includes('purge') && this.guild.members.has(this.author.id)) return false
					
					if (!options['mentions'].includes(`u:${this.author.id}`)) return false
					if (this.member && !this.member.roles.some(role => options['mentions'].includes(`r:${role.id}`))) return false
				}

				if (containsLink && (options['links'] && options['links'] instanceof Array)) {
					return options['links'].some(link => typeof link == 'string' && this.content.match(link))
				}

				if (containsCommand && (options['commands'] && options['commands'] instanceof Array)) {
					return options['commands'].some(cmd => typeof cmd == 'string' && this.content.startsWith(cmd))
				}

				if (containsFiles && (options['files'] && options['files'] instanceof Array)) {
					return options['files'].some(type => this.attachments.some(f => f.name.includes(type)))
				}
			}

			filters = new Filters(filters)

			if (filters.has('PINNED') && this.pinned) return false
			if (filters._bitfield == Filters.FLAGS.ALL) return true

			if (filters.has('TEXT') && (!containsLink && !containsFiles && !containsEmbed)) return true
			if (filters.has('DISCORD') && (this.system || this.type != 'DEFAULT')) return true
			if (filters.has('INVITES') && this.content.match(Exps.invites)) return true
			if (filters.has('LINKS') && containsLink) return true
			if (filters.has('COMMAND') && containsCommand) return true
			if (filters.has('FILES') && containsFiles) return true
			if (filters.has('EMBEDS') && containsEmbed) return true
		
			return false
		}
	}

	return CleanupMessage
})

function channelIDOrDM(channel) {
	if (channel.type != 'dm') return channel.id
	return 'dm'
}