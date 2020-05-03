const BaseCommand = require('./base');
const { Command } = require('discord.js-commando');
const { RegularExpressions, ImageFormats } = require('../../util/Constants');
const { createTimestamp } = require('../../util/Utils');
const Filters = require('../../util/Filters');

class CleanupCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'cleanup',
            group: 'moderation',
            memberName: 'cleanup-guild',
            aliases: ['clean'],
            format: '<parameters>',
            description: 'Clean messages of a certain kind from the channel.',
            
            guildOnly: true,
            clientPermissions: ['MANAGE_MESSAGES', 'VIEW_CHANNEL'],
            throttling: { usages: 1, duration: 2 },
            guarded: true,

            argsType: 'multiple'
        });
    }

    hasPermission(msg) {
        return Boolean(this.client.isOwner(msg.author)||msg.member.permissionsIn(msg.channel).has('MANAGE_MESSAGES'));
    } 

    async run(msg, args) {
        let messages = [];
        try {
            if (msg.channel.type == 'text') {
                if (!msg.guild || !msg.guild.available) return new Error('The guild either no longer exists.. or is unavailable..');
                let filters = [];
                let options = {
                    /* set the default options */
                    command: msg,
                    channels: [msg.channel.id],
                    limit: 100
                };

                if (args.length > 0) {
                    let errors = [];
                    const promise = (array, callback) => {
                        return Promise.all(array.map((v, i) => callback(v, i, array)));
                    };

                    promise(args, (arg, index, args) => {
                        arg = arg.startsWith('-') ? arg.toLowerCase().slice(1).trim() : arg.toLowerCase();
                        const nextIndex = parseInt(index + 1);
                        const prevIndex = parseInt(index - 1);

                        let remainingArgString = msg.argString.substring(msg.argString.indexOf(args[nextIndex]) - 1).trim();

                        switch (arg) {
                            case 'before':
                                const possibleBefore = [...args].slice(nextIndex);
                                
                                if (possibleBefore.length < 1) {
                                    errors.push(`Incorrect usage, please provide a valid message id, date string or message link following the \`${arg}\` parameter.\n\n‣ Date strings consist of one number, followed by a letter or word representing the duration.. for example: \`1d\` equals \`1 day\`.`);
                                    break;
                                }

                                const possibleBeforeDateStrings = possibleBefore.join(' ').trim().match(RegularExpressions.date_string);
                                if (possibleBeforeDateStrings && possibleBeforeDateStrings.length > 0) {
                                    let dates = [];
                                    possibleBeforeDateStrings.some((value) => {
                                        if (args.indexOf(value) == nextIndex) {
                                            dates.push(value);
                                            args.splice(nextIndex, 1);
                                        } else return true;
                                    });

                                    if (dates.length > 0) options['before'] = createTimestamp(new Date().getTime(), dates).getTime();
                                } else if ((/^\d+$/g).test(possibleBefore[0]) || RegularExpressions.message_links.test(possibleBefore[0])) {
                                    options['before'] = possibleBefore[0];
                                }

                                if (!options.before) break;

                                args.splice(nextIndex, 1);
                                break;

                            case 'after':
                                    const possibleAfter = [...args].slice(nextIndex);
                                    
                                    if (possibleAfter.length < 1) {
                                        errors.push(`Incorrect usage, please provide a valid message id, date string or message link following the \`${arg}\` parameter.\n\n‣ Date strings consist of one number, followed by a letter or word representing the duration.. for example: \`1d\` equals \`1 day\`.`);
                                        break;
                                    }
    
                                    const possibleAfterDateStrings = possibleAfter.join(' ').trim().match(RegularExpressions.date_string);
                                    if (possibleAfterDateStrings && possibleAfterDateStrings.length > 0) {
                                        let dates = [];
                                        possibleAfterDateStrings.some((value) => {
                                            if (args.indexOf(value) == nextIndex) {
                                                dates.push(value);
                                                args.splice(nextIndex, 1);
                                            } else return true;
                                        });
    
                                        if (dates.length > 0) options['after'] = createTimestamp(new Date().getTime(), dates).getTime();
                                    } else if ((/^\d+$/g).test(possibleAfter[0]) || RegularExpressions.message_links.test(possibleAfter[0])) {
                                        options['after'] = possibleAfter[0];
                                    }
    
                                    if (!options.after) break;
    
                                    args.splice(nextIndex, 1);
                                    break;

                            case 'attachments':
                            case 'attachment':
                            case 'files':
                            case 'file':
                                const possibleFileExtentions = [...args].slice(nextIndex);
                                filters.push('FILE');

                                if (possibleFileExtentions.length < 1) break;

                                let file_exts = [];
                                possibleFileExtentions.some((value) => {
                                    if (!value.match(/^\.[^.]+$/gi)) return true;
                                    file_exts.push(value);
                                    args.splice(nextIndex, 1);
                                });

                                if (file_exts.length < 1) break;
                                file_exts.forEach((ext) => {
                                    if (!options.attachments) options['attachments'] = [];
                                    options.attachments.push(ext);
                                });

                                break;

                            case 'images':
                            case 'image':
                            case 'imgs':
                            case 'img':
                                const possibleImageExtentions = [...args].slice(nextIndex);
                                filters.push('IMAGE');

                                if (possibleImageExtentions.length < 1) break;

                                let image_exts = [];
                                possibleImageExtentions.some((value) => {
                                    if (!value.match(/^\.[^.]+$/gi) || !ImageFormats.includes(value.replace('.', ''))) return true;
                                
                                    image_exts.push(value);
                                    args.splice(nextIndex, 1);
                                });

                                if (image_exts.length < 1) break;
                                image_exts.forEach((ext) => {
                                    if (!options.attachments) options['attachments'] = [];
                                    options.attachments.push(ext);
                                });

                                break;

                            case 'contains':
                            case 'text':
                            case 'txt':
                                const possibleQuotes = remainingArgString.match(RegularExpressions.quotes);
                                filters.push('TEXT');

                                

                                if (!possibleQuotes || possibleQuotes.length < 1) break;

                                let quotes = [];
                                possibleQuotes.some((value) => {
                                    value = value.replace(/["']/g, '');
                                    if (args.indexOf(value) == nextIndex) {
                                        quotes.push(value);
                                        args.splice(nextIndex, 1);
                                    } else return true;
                                });

                                if (quotes.length < 1) break;

                                quotes.forEach((quote) => {
                                    if (!options.contains) options['contains'] = [];
                                    options.contains.push(quote);
                                });

                                break;

                            case 'startswith':
                            case 'starts-with':
                            case 'commands':
                            case 'command':
                            case 'cmds':
                            case 'cmd':
                                const possibleCmds = remainingArgString.match(RegularExpressions.symbols_and_quotes);
                                filters.push('COMMAND');

                                if (!possibleCmds || possibleCmds.length < 1) break;

                                let cmds = [];
                                possibleCmds.some((value) => {
                                    value = value.replace(/["']/g, '');
                                    if (args.indexOf(value) == nextIndex) {
                                        cmds.push(value);
                                        args.splice(nextIndex, 1);
                                    } else return true;
                                });

                                if (cmds.length < 1) break;

                                cmds.forEach((cmd) => {
                                    if (!options.startsWith) options['startsWith'] = [];
                                    options.startsWith.push(cmd);
                                });

                                break;

                            case 'links':
                            case 'link':
                                const possibleLinks = [...args].slice(nextIndex);
                                filters.push('LINK');

                                if (possibleLinks.length < 1) break;

                                let links = [];
                                possibleLinks.some((value) => {
                                    if (!RegularExpressions.links.test(value)) return true;

                                    links.push(value);
                                    args.splice(nextIndex, 1);
                                });

                                if (links.length < 1) break;

                                links.forEach((link) => {
                                    if (!options.links) options['links'] = [];
                                    options.links.push(link);
                                });

                                break;

                            case 'embeds':
                            case 'embed':
                                filters.push('EMBED');
                                break;

                            case 'bots':
                            case 'bot':
                                if (!options.mentions) options['mentions'] = [];
                                if (!options.mentions.includes('bots')) options.mentions.push('bots');
                                break;

                            case 'purge':
                                if (!options.mentions) options['mentions'] = [];
                                if (!options.mentions.includes('purge')) options.mentions.push('purge');
                                break;

                            case 'discord':
                                filters.push('DISCORD');
                                break;

                            case 'invites':
                            case 'invite':
                            case 'invs':
                            case 'inv':
                                filters.push('INVITE');
                                break;

                            case 'limit':
                            case 'amount':
                                if (args[nextIndex].match(/^\d+$/g)) {
                                    options.limit = parseInt(args[nextIndex]);
                                    args.splice(nextIndex, 1);
                                } else errors.push(`Invalid usage, please provide a number following the \`${arg}\` parameter.`)

                                break;

                            case 'all':
                                filters = new Filters(Filters.ALL).freeze().bitfield;
                                break;

                            case 'pinned':
                                filters.push('PINNED');
                                break;

                            default:

                                if (arg.match(/<@!?\d+>/g)) {
                                    this.client.users.fetch(arg.replace(/\D+/g, '')).then(user => {
                                        if (!options.mentions) options['mentions'] = [];
                                        if (!options.mentions.includes(user.id)) options.mentions.push(user.id);
                                    }).catch(() => {
                                        errors.push(`User \`${arg.replace(/\D+/g, '')}\` couldn't be found.`);
                                    });

                                    break;
                                }

                                if (arg.match(/<@&\d+>/g)) {
                                    msg.guild.roles.fetch(arg.replace(/\D+/g, '')).then(role => {
                                        if (!options.mentions) options['mentions'] = [];
                                        if (!options.mentions.includes(role.id)) options.mentions.push(role.id);
                                    }).catch(() => {
                                        errors.push(`User \`${arg.replace(/\D+/g, '')}\` couldn't be found.`);
                                    });

                                    break;
                                }

                                if (arg.match(/<#\d+>/g)) {
                                    errors.push('Channel mentions are currently disabled.');
                                    break;
                                }

                                if (arg.match(/^\d+$/g)) {
                                    options.limit = parseInt(arg);
                                    break;
                                }

                                /** error message handling */
                                switch(args[prevIndex]) {
                                    case 'before': case 'after': errors.push(`\`${arg}\` isn't a valid message id, message link or date string for the \`${args[prevIndex]}\` parameter.\n\n‣ Date strings consist of one number, followed by a letter or word representing the duration.. for example: \`1d\` equals \`1 day\`.`); break;
                                    case 'attachments': case 'attachement': case 'files': case 'file': errors.push(`\`${arg}\` isn't a valid file extension for the \`${args[prevIndex]}\` parameter`); break;
                                    case 'images': case 'image': case 'imgs': case 'img': errors.push(`\`${arg}\` isn't a valid file extension for the \`${args[prevIndex]}\` parameter.\n\n‣ Valid extensions include, \`${ImageFormats.join('\`, \`')}\``); break;
                                    case 'text': case 'txt': case 'contains': errors.push(`\`${arg}\` isn't a valid quote for the \`${args[prevIndex]}\` parameter.\nPlease make sure any words/sentences are surrounded in quotation marks and seperated by commas, or spaces.`); break;
                                    case 'commands': case 'commands': case 'cmds': case 'cmd': case 'startsWith': errors.push(`\`${arg}\` is not a valid prefix or quote for the \`${args[prevIndex]}\` parameter.\nPlease make sure any prefixes/words/sentences are surrounded in quotation marks and seperated by commas, or spaces.`); break;
                                    case 'links': case 'link': errors.push(`\`${arg}\` isn't a valid link for the \`${args[prevIndex]}\` parameter.`); break;
                                    default: errors.push(`\`${arg}\` is not a valid parameter.`); break;
                                }
                        }
                    }).then(() => {
                        if (filters.length == 0) {
                            if (options.before || options.after || options.mentions) filters = new Filters(Filters.ALL).freeze().bitfield;
                            else if (options.limit && (!options.before && !options.after && !options.mentions)) errors.push('Not enough parameters, please provide more.');
                            else errors.push('No parameters recognised, parameters are required.');
                        }

                        if (errors.length > 0) {
                            let error = `• ${errors.join('\n\n• ')}\n\nfor further assistance use ${Command.usage('help', msg.guild.commandPrefix, null)},\nor for a list of available parameters visit our [DiscordBots Page](https://discordbots.org/bot/420013638468894731)`;
                            messages.push(msg.direct('', { embed: { title: 'Cleanup Parameter Errors', color: 'ff0000', description: `We've found a few errors with the parameters you've provided..\n\n${error}` } }).then(m => m.delete({ timeout: 30000, reason: 'Parameter errors' })))
                            return messages;
                        }

                        console.log(options);

                        for (let i = 0; i < options.channels.length; i++) {
                            const channel = msg.guild.channels.cache.has(options.channels[i]) ? msg.guild.channels.cache.get(options.channels[i]) : null;
                            if (channel) {
                                let started = Date.now();
                                channel.clean(filters, options).then(deleted => {
                                    if (deleted.size > 0) messages.push(msg.channel.send('', { embed: { color: '00ff00', description: `Successfully deleted **${deleted.size}** messages from <#${channel.id}>`, footer: { text: `Cleaning completed in ${new Date(Date.now() - started).getTime()}ms.` } } }).then(m => m.delete({ timeout: 3000, reason: 'Cleaning successful' })));
                                    else messages.push(msg.channel.send('', { embed: { color: 'ff0000', description: `Couldn't delete any messages..` } }).then(m => m.delete({ timeout: 3000, reason: 'Cleaning unsuccessful' })));
                                    return messages;
                                });
                            }
                        }
                    }).catch((e) => {
                        this.client.emit('error', e);
                        return null;
                    });
                } else {
                    messages.push(msg.direct('', { embed: { title: 'Cleanup Parameter Error', color: 'ff0000', description: `The cleanup command requires parameters to function, for a list of available parameters visit our [DiscordBots Page](https://discordbots.org/bot/420013638468894731)` } }).then(m => m.delete({ timeout: 30000, reason: 'Automated deletion.' })));
                    return messages;
                }
            } else {
                return null;
            }
        } catch (e) {
            this.client.emit('error', e);
            return null;
        }
    }
}

module.exports = CleanupCommand;