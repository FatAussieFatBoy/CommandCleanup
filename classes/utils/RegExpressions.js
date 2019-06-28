module.exports = {
	/**
	 * A Regular Expression that detects the most common symbols and commands
	 * @type {RegularExpression}
	 */

	symbols: new RegExp(/^.{0,3}([a-z])[-!$%^&_+|~=:;?,.\/\\]|^.{0,3}[-!$%^&_+|~=:;?,.\/\\]|^.{0,3}[-!$%^&_+|~=:;?,.\/\\]([a-z])/gi),

	/**
	 * A Regular Expression that detects links
	 * @type {RegularExpression}
	 */

	links: new RegExp(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm),

	/**
	 * A Regular Expression that detects discord invites
	 * @type {RegularExpression}
	 */

	invites: new RegExp(/(?:https:?\/)?discord(?:app.com\/invite|.gg)/gmi)
}
