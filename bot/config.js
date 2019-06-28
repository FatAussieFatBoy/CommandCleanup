const config = {
	owner: 'owners-id',

	prefix: '.',

	token: 'the-bot-token',

	/* 
	 * Bot admins, level 9.
	 * Permissions:
	 * Reboot the bot
	 * Inherits bot support permissions
	 */

	admins: [],

	/*
	 * Bot support, level 8.
	 * Permissions:
	 * Reload commands
	 * Display bot stats
	 * Inherits server owner permissions
	 */

	support: [],

	/* Permission level functions */
	levels: [

		/*
		 * Default user, level 0.
		 * Permissions:
		 * Display help
		 * Generate bot invite link
		 * Display leaderboard
		 */

		{
			level: 0,
			name: 'User',
			/* Every user should have this permission, so no checks */
			check: () => true
		},

		/*
		 * Server moderator, level 2.
		 * Permissions:
		 * Use cleanup
		 */

		{
			level: 2,
			name: 'Server Moderator',
			check: (message) => {
				try {
					const member = message.guild.member(message.author)
					if (member) return member.permissionsIn(message.channel).has('MANAGE_MESSAGES')
				} catch (e) {
					return false
				}
			}
		},

		/*
		 * Server admin, level 3.
		 * Permissions:
		 * Manage schedules
		 * Inherits server moderator permissions
		 */

		{
			level: 3,
			name: 'Server Admin',
			check: (message) => {
				try {
					const member = message.guild.member(message.author)
					if (member) return member.permissionsIn(message.channel).has(['MANAGE_MESSAGES', 'MANAGE_CHANNEL'], true)
				} catch (e) {
					return false
				}
			}
		},

		/*
		 * Server owner, level 4.
		 * Permissions:
		 * Manage server settings
		 * Inherits server admin permissions
		 */

		{
			level: 4,
			name: 'Server Owner',
			check: (message) => message.channel.type == 'text' ? (message.guild.owner.id == message.author.id ? true : false) : false
		},

		/* Functions for bot support, bot admin and bot owner permissions */
		
		{
			level: 8,
			name: 'Bot Support',
			check: (message) => config.support.includes(message.author.id)
		},

		{
			level: 9,
			name: 'Bot Admin',
			check: (message) => config.admins.includes(message.author.id)
		},

		{
			level: 10,
			name: 'Bot Owner',
			check: (message) => config.owner == message.author.id
		}
	]
}

module.exports = config
