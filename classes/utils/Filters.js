class Filter {
	constructor(filters) {
		/**
		 * Bitfield value of the packed filters
		 * @type {number}
		 * @private
		 */

		this._bitfield = !parseInt(filters) ? this.constructor.resolve(filters) : filters
	}

	/**
	 * Checks whether the bitfield has a filter, or multiple filters.
	 * @param {string[]|number} - Filter(s) to check against.
	 * @returns {boolean}
	 */

	has(filters) {
		if (filters instanceof Array) return filters.map(f => this.has(f))
		filters = this.constructor.resolve(filters)
		return (this._bitfield & filters) == filters
	}

	/**
	 * Resolves filters to their numeric form.
	 * @param {string[]|string|number} - Filter(s) to resolve.
	 * @returns {number}
	 */

	static resolve(filter) {
		if (filter instanceof Array) return filter.map(f => this.resolve(f)).reduce((prev, p) => prev | p, 0)
		if (typeof filter == 'string') return Filter.FLAGS[filter]
		if (Number.isNaN(filter) || filter < 0) throw new RangeError('couldn\'t resolve filter to it\'s numeric form.')
		return filter
	}
}

Filter.FLAGS = {
	TEXT: 1 << 0, // 1
	DISCORD: 1 << 1, // 2
	INVITES: 1 << 2, // 4
	PINNED: 1 << 3, // 8
	EMBEDS: 1 << 4, //16
	LINKS: 1 << 5, // 32
	COMMAND: 1 << 6, // 64
	FILES: 1 << 7 // 128
}

Filter.FLAGS.ALL = Object.keys(Filter.FLAGS).reduce((all, p) => all | Filter.FLAGS[p], 0)

module.exports = Filter
