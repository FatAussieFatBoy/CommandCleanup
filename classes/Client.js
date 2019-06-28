const { Client, Collection  } = require('discord.js')
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)

class CleanupClient extends Client {
	constructor(options) {
		super(options)

		this.commands = new Collection()
		this.aliases = new Collection()

		// if (options.owner) {
		// 	this.once('ready', () => {
		// 		if (options.owner instanceof Array || options.owner instanceof Set) {
		// 			for (const owner of options.owner) {
		// 				this.users.fetch(owner).catch((e) => {
		// 					this.emit('warn', `Unable to fetch owner ${owner}.`)
		// 					this.emit('error', e)
		// 				})
		// 			}
		// 		} else {
		// 			this.users.fetch(options.owner).catch((e) => {
		// 				this.emit('warn', `Unable to fetch owner ${owner}.`)
		// 				this.emit('error', e)
		// 			})
		// 		}
		// 	})
		// }
	}

	async loadCommands(directory) {
		const files = await readdir(directory)
		files.forEach((f) => {
			if (!f.endsWith('.js')) return
			const name = f.split('.')[0]
			try {
				const props = require(`${directory.endsWith('/') ? directory : `${directory}/`}${f}`)
				if (props.init) props.init(this)
				this.commands.set(props.help.name, props)
				if (props.config.aliases) props.config.aliases.forEach((alias) => this.aliases.set(alias, props.help.name))
				this.emit('debug', `loaded command ${name}`)
			} catch (e) {
				this.emit('warn', `couldn't load command ${name}\n${e.stack}`)
			}
		})
	}

	async loadEvents(directory) {
		const files = await readdir(directory)
		files.forEach((f) => {
			if (!f.endsWith('.js')) return
			const name = f.split('.')[0]
			try {
				const event = require(`${directory.endsWith('/') ? directory : `${directory}/`}${f}`)
				this.on(name, event.bind(null, this))
				this.emit('debug', `loaded event ${name}`)
			} catch (e) {
				this.emit('warn', `couldn't load event ${name}\n${e.stack}`)
			}
		})
	}

	// get owners() {
	// 	if (!this.options.owner) return null
	// 	if (typeof this.options.owner == 'string') return [this.users.get(this.options.owner)]
	// 	const owners = []
	// 	for (const owner of this.options.owner) owners.push(this.users.get(owner))
	// 	return owners
	// }

	// isOwner(user) {
	// 	if (!this.options.owner) return null
	// 	user = this.users.resolve(user)
	// 	if (!user) throw new RangeError('Unable to resolve user.')
	// 	if (typeof this.options.owner == 'string') return user.id == this.options.owner
	// 	if (this.options.owner instanceof Array) return this.options.owner.includes(user.id)
	// 	if (this.options.owner instanceof Set) return this.options.owner.has(user.id)
	// 	throw new RangeError('The client\'s "owner" options is an unknown value.')
	// }

	async destroy() {
		await super.destroy()
	}
}

module.exports = CleanupClient;
