'use strict';

/**
 * The filter options object used to target specific messages in detail.
 * @typedef {Object} FilterOptions
 * @property {Array<String|MemberResolveable|UserResolvable|RoleResolvable>} [mentions]
 * @property {Message|Snowflake|TimeFrame} [before]
 * @property {Message|Snowflake|TimeFrame} [after]
 * @property {Array<String>} [contains]
 * @property {Array<String>} [startsWith]
 * @property {Array<String>} [attachmentTypes]
 */

exports.DefaultFilterOptions = { limit: 100 };

exports.DefaultGuildSettings = {

};

exports.ImageFormats = ['webp', 'png', 'jpg', 'jpeg', 'gif'];

exports.RegularExpressions = {
    /**
     * Regular Expression that matches the most common symbols used as prefixes
     * @type {RegExp}
     */

    symbols: new RegExp(/[^\w\s"',-]+(\w)*/gm),

    /**
     * Regular Expression that matches whitespace characters, spaces and commas in quotations
     * @type {RegExp}
     */

    quotes: new RegExp(/("((?=[^"])[^"]+)"|'((?=[^'])[^']+)')+?(?=,|$|\s*)/gm),

    /**
     * Regular Expression that matches symbols and quotes
     * @type {RegExp}
     */

    symbols_and_quotes: new RegExp(/([^\w\s"',-]+(\w)*|"((?=[^"])[^"]+)"|'((?=[^'])[^']+)')+?(?=,|$|\s*)/gm),

    /**
     * Regular Expression that matches emojis
     * @type {RegExp}
     */

    emojis: new RegExp(/(<(a)?:[^:<>]+:([0-9]+)>)/gm),

    /**
     * Regular Expression that matches links
     * @type {RegExp}
     */

    links: new RegExp(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm),

    /**
     * Regular Expression that matches image links
     * @type {RegExp}
     */

    image_links: new RegExp(`(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?(?:${module.exports.ImageFormats.join('|')})`, 'gim'),

    /**
     * Regular Expression that matches discord message links
     * @type {RegExp}
     */

    message_links: new RegExp(/(?:https:?\/)?discord(?:(app.com|.gg)\/channels(\/\d+){3})/gim),

    /**
     * Regular Expression that matches discord invites
     * @type {RegExp}
     */

    invites: new RegExp(/(?:https:?\/)?discord(?:(app.com|.gg)\/invite)/gim),

    /**
     * Regular Expression that matches date string identifiers
     * @type {RegExp}
     */

    date_string: new RegExp(/\d+\s{0,1}[dhms]{1}/gi)
};