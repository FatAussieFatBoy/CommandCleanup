/* check node.js version is above 10 */
if (Number(process.version.slice(1).split('.')[0]) < 10) throw new Error('Node 10.0.0 or higher is required. Update Node on your system.')

const CommandCleanup = require('../index.js')
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)

const client = new CommandCleanup.Client({
	disableEveryone: true,
	messageCacheLifetime: 600,
	messageSweepInterval: 300
})

const init = () => {
	client.prefix = require('./config.js').prefix
	client.levels = require('./config.js').levels

	client.loadCommands(`${__dirname}/commands/`)
	client.loadEvents(`${__dirname}/events/`)

	client.login(client.token)
}

client.on('error', e => console.error(e.stack || JSON.stringify(e) || e.toString()))
client.on('warn', e => console.warn(e))
client.on('debug', e => console.debug(e))

client.on('ready', () => {
	client.user.setActivity(`${client.prefix}help & ${client.prefix}invite`, { type: 'LISTENING' })
	console.log(`client on shard ${client.shard.ids[0]} ready and listening to; ${client.guilds.size} guilds, ${client.channels.filter(c => c.type == 'text').size} channels & ${client.users.size} users.`)
})

init()

/* class prototypes */
Object.defineProperty(String.prototype, "paragraph", {
	value: function(lineLength = 100) {
		if (!parseInt(lineLength)) throw new TypeError('the paragraphs desired line length must be a number.')
		let output = '', length = 0
		const lines = this.split(/\n+/g)

		for (let i = 0; i < lines.length; i++) {
			const words = lines[i].split(/\s+/g)
			let sentence = ''
			for (let j = 0; j < words.length; j++) {
				const word = words[j]
				if (((words.length + length) + sentence.split(/\s+/g).length) > lineLength) {
					if (word.length > lineLength) word = word.replace(new RegExp(`(.{${lineLength}})`, 'g'), '$1\n')
					output += `${sentence}\n`
					sentence = word
					length = sentence.length
				} else {
					sentence += ` ${word}`
					length += word.length
				}
			}

			output += `${sentence}\n`
			length = 0
		}

		return output
	}
})

Object.defineProperty(Array.prototype, "promise", {
	value: async function(callback) {
		if (!callback instanceof Function) throw new TypeError(`prototype Array.promise must be a function.`)
		const promises = this.map((v, i) => callback(v, i, this))
		await Promise.all(promises)
	}
})

Object.defineProperty(Map.prototype, "getKey", {
	value: function(value) {
		let key = null
		for (let [k, v] of this.entries()) {
			if (v == value) { key = k; break; }
		}

		if (key) return key
		return false
	}
})
