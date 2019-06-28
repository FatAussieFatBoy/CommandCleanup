module.exports = {
	Client: require('./classes/Client'),
	Guild: require('./classes/extensions/Guild'),
	Message: require('./classes/extensions/Message'),
	TextChannel: require('./classes/extensions/TextChannel'),

	CleanupFilters: require('./classes/utils/Filters'),
	CleanupRegExps: require('./classes/utils/RegExpressions')
}