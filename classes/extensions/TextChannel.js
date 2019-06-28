const { Structures, Collection, User, Message, MessageAttachment, MessageEmbed, Snowflake } = require('discord.js')
const Filters = require('../utils/Filters')

module.exports = Structures.extend('TextChannel', TextChannel => {
	class CleanupChannel extends TextChannel {
		constructor(...args) {
			super(...args)
		}

		async clean (filters, options = { limit: 100 }) {
			if (!options instanceof Object) throw new TypeError(`Invalid "options" property.`)

			this.client.emit('debug', `cleaning channel ${this.id},\n${filters},\n${JSON.stringify(options, null, 4)}`)
			return this.messages.fetch({ limit: 100 }).then(async messages => {
				if (messages.size < 1) return new Collection()

				const ids = [
					...messages.sort((a, b) => {
						a = a.createdTimestamp
						b = b.createdTimestamp
						return a > b ? -1 : a < b ? 1 : 0
					}).keys()
				].slice(0, options.limit).after(options.before).before(options.after).filter(id => Date.now() - Snowflake.deconstruct(id).date.getTime() < 1209600000).filter(id => {
					const message = messages.get(id)
					return message.matches(filters, options)
				})

				if (ids.length < 1) return new Collection()
				if (ids.length == 1) {
					await this.client.api.channels(this.id).messages(ids[0]).delete()
					const message = this.client.actions.MessageDelete.handle({
						channel_id: this.id,
						id: ids[0],
					}).message
					if (message) return new Collection([[message.id, message]])
					return new Collection()
				}

				await this.client.api.channels[this.id].messages['bulk-delete'].post({ data: { messages: ids } })
				return this.client.actions.MessageDeleteBulk.handle({
					channel_id: this.id,
					ids: ids,
				}).messages
			}).catch(e => this.client.emit('error', e))
		}

		/* attempts sending a message to user first, if it fails it fallsback on the channel */
		async sendToUser (user, content, options = {}) {
			if (!user instanceof User) throw new TypeError('Invalid "user" property defined.')
			if (content instanceof Object) {
				options = content
				content = ''
			}

			const { delay, reply } = options
			if (options['delay']) delete options['delay']
			if (options instanceof MessageAttachment) options = { files: [options['file']] }
			if (options instanceof MessageEmbed) {
				if (options['reply']) options['reply'] = undefined
				options = { embed: options }
			}

			if (options['embed'] && !options['embed']['footer'] && delay != null) {
				options['embed']['footer'] = {}
				options['embed']['footer'].text = `deleting message in ${Math.floor(parseInt(delay) / 1000)} seconds`
			}
			
			options['reply'] = reply
			let sent = null

			try {
				if (!user.dmChannel) user.createDM()
				await user.send(content, options).then((message) => {
					if (delay) message.delete({ timeout: delay })
					return message
				})
			} catch (e) {
				this.client.emit('warn', `user ${user.id} has blocked messages.`)
				await this.send(content, options).then((message) => {
					if (delay) message.delete({ timeout: delay })
					return message
				})
			}
		}
	}

	return CleanupChannel
})

/* useful prototypes */

Object.defineProperty(Array.prototype, "before", {
	value: function(value) {
		/* return all entries of an array before a certain value */
		if (value == null || typeof value == 'undefined') return this

		let newArray = []
		for (let index = 0; index < this.length; index++) {
			const v = this[index]
			if (value == v) {
				console.log(`match found at index ${index}`)
				newArray = this.slice(0, index--)
				break
			}
		}

		if (newArray.length == 0) return this
		console.log(newArray)
		return newArray
	}
})

Object.defineProperty(Array.prototype, "after", {
	value: function(value) {
		/* return all entries of an array after a certain value */
		if (value == null || typeof value == 'undefined') return this

		let newArray = []
		for (let index = 0; index < this.length; index++) {
			const v = this[index]
			if (value == v) {
				console.log(`match found at index ${index}`)
				newArray = this.slice(parseInt(index + 1))
				break
			}
		}

		if (newArray.length == 0) return this
		console.log(newArray)
		return newArray
	}
})