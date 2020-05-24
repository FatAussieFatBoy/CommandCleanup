'use strict';

const { Structures, SnowflakeUtil, Collection } = require('discord.js');
const Filters = require('../util/Filters');
const { DefaultFilterOptions, RegularExpressions } = require('../util/Constants');

module.exports = Structures.extend('TextChannel', TextChannel => {
    class CleanupChannel extends TextChannel {
        constructor(...args) {
            super(...args);
        }

        /**
         * Safer alternative to the default send method.
         * This method will attempt to send messages regardless of content,
         * if it fails than the embeds data will be converted into a message and attempted to be resent.
         * 
         * @param {StringResolvable|APIMessage} [content] @default ""
         * @param {MessageOptions|MessageAdditions} [options] @default {}
         * @returns {Promise<Message|Message[]>}
         */

        send(content, options) {
            if(!options && typeof content === 'object' && !(content instanceof Array)) {
				options = content;
                content = options.content || '';
                delete options.content;
            }

            if (this.permissionsFor(this.guild.me).missing(this.guild.me.permissions).includes('EMBED_LINKS')) {
                // sending message failed, try deconstructing embed into message content and send again..
                if (content.length > 0) content += '\n\n';
                if (options.embed.title) content += `${options.embed.title}\n`;
                if (options.embed.description) content += `${options.embed.description}\n`;
                if (options.embed.fields) {
                    for (let field of options.embed.fields) {
                        content += `\n${field.name}`;
                        content += `\n${field.value}\n\n`;
                    }
                }

                if (options.embed.image) {
                    if (!options.files) options['files'] = [];
                    options.files.push(options.embed.image);
                }

                if (options.embed.files) {
                    if (!options.files) options['files'] = [];
                    options.files.push(...options.files);
                }

                if (options.embed.footer && options.embed.footer.text) {
                    content += `${options.embed.footer.text}`;
                }

                delete options.embed;
                return super.send(content, options);
            } else return super.send(content, options);
        }

        /**
         * Clean the channel using filters and filter options.
         * @param {FilterResolveable} [filters] @default 0
         * @param {FilterOptions} [options] @default DefaultFilterOptions
         * @returns {Collection<Snowflake, Message>} - the deleted messages
         */

        async clean(filters = 0, options = DefaultFilterOptions) {
            if (!(options instanceof Object)) throw new TypeError('Invalid "options" provided. Must be an object of FilterOptions.');
            const _collected = await this._getFilteredMessages(filters, options);

            if (_collected.length == 0) return new Collection();
            if (_collected.length == 1) {
                await this.client.api.channels(this.id).messages(_collected[0]).delete();
                const message = this.client.actions.MessageDelete.getMessage({message_id: _collected[0]}, this);
                return message ? new Collection([[message.id, message]]) : new Collection();
            }

            await this.client.api.channels[this.id].messages['bulk-delete'].post({ data: { messages: _collected } });
            return _collected.reduce((col, id) => col.set(id, this.client.actions.MessageDeleteBulk.getMessage({ message_id: id }, this)), new Collection());
        }

        /**
         * Filter through the channels messages and grab all the ones that match the filters and options
         * @param {FilterResolveable} [filters] @default 0
         * @param {FilterOptions} [options] @default DefaultFilterOptions
         * @param {Message|Snowflake} [lastFetchedMessage] @default null
         * @return {Promise<Array<Snowflake>>}
         * @private
         */

        async _getFilteredMessages(filters = 0, options = DefaultFilterOptions, lastFetchedMessage = null) {
            
            filters = new Filters(filters).freeze();
            if (lastFetchedMessage) this.messages.resolve(lastFetchedMessage);

            const limit = options['limit'] && options.limit > 100 ? 100 : options['limit'] ? options.limit : 100;
            const _collected = [];

            return new Promise((resolve, reject) => {
                try {
                    this.messages.fetch({ limit: 100, before: lastFetchedMessage ? lastFetchedMessage : undefined }).then(messages => {
                        if (messages.size < 1) resolve([]);
        
                        let continueFiltering = true;
                        let _filtering = [...messages.sort((a, b) => {
                            a = a.createdTimestamp;
                            b = b.createdTimestamp;

                            if (a > b) return -1;
                            if (a == b) return 0;
                            if (a < b) return 1;
                        }).keys()];
                        
                        if (_filtering.length < 100) continueFiltering = false;

                        let reachedMaxAge = false;
                        _filtering = _filtering.filter(id => {
                            let isYoung = Boolean(Date.now() - SnowflakeUtil.deconstruct(id).date.getTime() < 1209600000);
                            if (!isYoung) reachedMaxAge = true;
                            return isYoung;
                        });

                        lastFetchedMessage = [..._filtering].pop();
                        
                        if (options.before || options.after) {
                            let temp = [..._filtering],
                                beforeIndex = undefined,
                                afterIndex = temp.length;

                            for(let i = 0; i < temp.length; i++) {
                                if (options.before && beforeIndex == undefined) {
                                    if (typeof options.before == 'string') {
                                        if (RegularExpressions.message_links.test(options.before)) options['before'] = options.before.split('/').pop();
                                        if (options.before !== _filtering[i]) continue;
                                        i++; //prevents the matching entry being selected.
                                    } else if (!(Number.isNaN(options.before))) {
                                        if (SnowflakeUtil.deconstruct(_filtering[i]).date.getTime() > options.before) continue;
                                    }
            
                                    beforeIndex = i;
                                    if (!options.after) break; //not looking for 'after', break the loop
                                }
            
                                if (options.after) {
                                    if (typeof options.after == 'string') {
                                        if (RegularExpressions.message_links.test(options.after)) options['after'] = options.after.split('/').pop();
                                        if (options.after !== _filtering[i]) continue;
                                    } else if (!(Number.isNaN(options.after))) {
                                        if (SnowflakeUtil.deconstruct(_filtering[i]).date.getTime() > options.after) continue;
                                    }
            
                                    afterIndex = i;
                                    continueFiltering = false;
                                    break; //'after' was found, this should end no matter what
                                }
                            }

                            _filtering = temp.slice(beforeIndex, afterIndex);
                        }
            
                        for (let i = 0; i < _filtering.length; i++) {
                            const id = _filtering[i];
                            const msg = messages.get(id);
            
                            if (options['ignore'] && (options.ignore.includes(msg.id))) continue;

                            if (msg.pinned && !filters.has('PINNED')) continue;
                            else if (msg.matches(filters, options)) _collected.push(id);

                            continue;
                        }
            
                        if (_collected.length > limit) resolve(_collected.splice(0, limit > 100 ? 100 : limit));
                        else if (_collected.length >= 0 && _collected.length < limit && !reachedMaxAge && continueFiltering) {
                            options['limit'] = parseInt(limit - _collected.length);
                            this.client.setTimeout(() => {
                                this._getFilteredMessages(filters, options, lastFetchedMessage).then(collected => {
                                    for (let col of collected) _collected.push(col);
                                    resolve(_collected);
                                });
                            }, 750);
                        } else resolve(_collected);
                    });
                } catch (e) {
                    reject(new Error(e));
                }
            });
        }
    }

    return CleanupChannel;
});