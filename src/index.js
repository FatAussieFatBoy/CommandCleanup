module.exports = {
    Client: require('./client/Client'),

    Guild: require('./structures/Guild'),
    Message: require('./structures/Message'),
    TextChannel: require('./structures/TextChannel'),
    Scan: require('./structures/Scan'),

    Filters: require('./util/Filters'),
    ConsoleHandler: require('./util/ConsoleHandler'),
    Constants: require('./util/Constants'),
    Utils: require('./util/Utils'),

    version: require('../package.json').version
};