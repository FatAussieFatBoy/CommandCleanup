'use strict';

const { Structures } = require('discord.js');
const Filters = require('../util/Filters');
const { RegularExpressions, DefaultFilterOptions, ImageFormats } = require('../util/Constants');

module.exports = Structures.extend('Message', Message => {
    class CleanupMessage extends Message {
        constructor(...args) {
            super(...args);
        }

        /**
         * Resolve the messages content and return the filters
         * @return {Filters}
         */

        get filters() {
            return new Filters(this.constructor.resolveFilters(this)).freeze();
        }

        has(filters) {
            return this.filters.has(filters);
        }

        /**
         * Check if the messages filters contains a filter
         * @param {FilterResolveable} filters
         * @return {Boolean|Array<Boolean>}
         */

        any(filters) {
            return this.filters.any(filters);
        }

        /**
         * Check if the messages content matches the filter and filter options.
         * @param {FilterResolveable} filters
         * @param {FilterOptions} [options] @default DefaultFilterOptions {@link Constants#FilterOptions}
         * @return {Boolean|Array<Boolean>}
         */

        matches(filters, options = DefaultFilterOptions) {
            if (Object.keys(options).length !== 0) {
                if (options['mentions']) {
                    if (!Array.isArray(options.mentions)) options['mentions'] = [options.mentions];
                    if (options.mentions.map((x) => x.toLowerCase()).includes('bots') && !this.author.bot) return false;
                    if (options.mentions.map((x) => x.toLowerCase()).includes('purge')) {
                        if (this.guild && this.guild.available) {
                            if (this.guild.members.cache.has(this.author.id)) return false;
                        } else return false;
                    }
                    
                    const userMentions = options.mentions.filter(m => this.client.users.cache.has(m));
                    if (userMentions.length > 0 && !(userMentions.includes(this.author.id))) return false;

                    const roleMentions = options.mentions.filter(m => this.guild.roles.cache.has(m));
                    if (roleMentions.length > 0 && (this.member && !(this.member.roles.cache.keyArray().some(r => roleMentions.includes(r))))) return false;
                }

                if ((options['contains'] && options.contains.length > 0) && (this.cleanContent !== null)) {
                    const links = options['contains'].filter(str => RegularExpressions.links.test(str));
                    const quotes = options['contains'].filter(str => !links.includes(str));
                    
                    if (quotes.length > 0) {
                        return !!quotes.some(q => typeof q == 'string' && this.cleanContent.includes(q));
                    }

                    if (this.has('LINK') && links.length > 0) {
                        return !!links.some(l => typeof l == 'string' && this.cleanContent.match(l));
                    }
                }

                if ((options['startsWith'] && options.startsWith.length > 0) && this.cleanContent !== null) {
                    const symbols = options.startsWith.filter(str => RegularExpressions.symbols.test(str));
                    const unrecognised = options.startsWith.filter(str => !symbols.includes(str));
                    return !!unrecognised.some(u => typeof u == 'string' && this.cleanContent.startsWith(u)) || !!symbols.some(s => typeof s == 'string' && this.cleanContent.startsWith(s));
                }

                if ((options['attachments'] && options.attachments.length > 0) && this.attachments.size > 0) {
                    const images = options['attachments'].filter(ext => ImageFormats.includes(ext.replace('.', '')));
                    const files = options['attachments'].filter(ext => !images.includes(ext.replace('.', '')));
                    
                    if (this.has('IMAGE') && images.length > 0) {
                        return !!images.some(i => this.attachments.some(a => a.height && a.name && a.name.split('.').includes(i.replace('.', ''))));
                    }

                    if (this.has('FILE') && files.length > 0) {
                        return !!files.some(f => this.attachments.some(a => a.name && a.name.split('.').includes(f.replace('.', ''))));
                    }
                }
            }

            return this.any(filters);
        }

        /**
         * Resolve a messages filter number based on it's contents.
         * @param {Message} message
         * @return {FilterResolveable}
         */

        static resolveFilters(message) {
            try {
                // get the first word of the message content for isCommand checking
                const firstWord = message.cleanContent.split(/[\s\t\n]/g, 1)[0];

                const containLinks = Boolean(RegularExpressions.links.test(message.cleanContent) || (message.embeds && message.embeds.length > 0 && message.embeds.some(e => e.type == 'link')));
                const isCommand = Boolean(message.isCommand || (RegularExpressions.symbols.test(firstWord) && !RegularExpressions.emojis.test(firstWord)));
                const containFiles = Boolean(message.attachments && message.attachments.size > 0 && message.attachments.some(a => !a.height || a.height && !(ImageFormats.includes(a.name.split('.')[a.name.split('.').length - 1]))));
                const containImages = Boolean((message.attachments && message.attachments.size > 0 && !containFiles) || RegularExpressions.image_links.test(message.cleanContent) || (message.embeds && message.embeds.length > 0 && message.embeds.some(e => e.type == 'image' || e.type == 'gifv')));
                const containEmbeds = Boolean(message.embeds && message.embeds.length > 0);

                let filters = [];

                if (message.pinned) filters.push('PINNED');
                if (message.system || message.type !== 'DEFAULT') filters.push('SYSTEM');
                if (message.partial) filters.push('PARTIAL');
                if (message.tts) filters.push('TTS');
                if (message.webhookID) filters.push('WEBHOOK');

                if (!containLinks && !containFiles && !containImages && !containEmbeds) filters.push('TEXT');
                if (message.cleanContent.match(RegularExpressions.emojis)) filters.push('EMOJI');
                if (message.cleanContent.match(RegularExpressions.invites)) filters.push('INVITE');
                if (containLinks) filters.push('LINK');
                if (isCommand) filters.push('COMMAND');
                if (containFiles) filters.push('FILE');
                if (containImages) filters.push('IMAGE');
                if (containEmbeds) filters.push('EMBED');
                
                return filters;
            } catch (e) {
                throw new Error(e);
            }
        }

        /**
         * Attempt to send a message to the messages author directly
         * If failed it will attempt to send the messages to the channel the message was posted in.
         * @param {StringResolvable|APIMessage} [content] @default ""
         * @param {MessageOptions|MessageAdditions} [options] @default {}
         * @returns {Promise<Message|Message[]>}
         */

        direct(content, options) {
            return super.direct(content, options).catch((e) => {
                return super.reply(content, options).catch((e) => {
                    this.client.emit('error', e);
                });
            });
        }
    }

    return CleanupMessage;
});