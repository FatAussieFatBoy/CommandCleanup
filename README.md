# CommandCleanup • [![Discord Shield](https://discordapp.com/api/guilds/417535126088450048/widget.png?style=shield)](https://discord.gg/Gkdbyeh) [![Discord Bots](https://top.gg/api/widget/status/420013638468894731.svg?noavatar=true)](https://top.gg/bot/420013638468894731) ![Discord Bots](https://top.gg/api/widget/servers/420013638468894731.svg?noavatar=true)
<p>CommandCleanup is a bot that can delete a variety of different messages, wether it be messages that begin with the most common command symbols, messages by a certain user or messages sent by bots, there is a command/parameter that'll help clean up your chats regardless of what's posted.</p>

---

### Commands

###### cleanup 
> Pairing this command with [parameters](#parameters) gives you **MAXIMUM** chat moderation control</br>
> <samp>requires permissions: `MANAGE MESSAGES`</samp>

###### invite
> Get an invite link to add the bot to more servers

###### help
> Sends helpful documentation about commands, their usages, their aliases and even a short description

---

### Parameters

Parameters allow for 100% control over the content deleted, giving you complete chat moderation control.</br>

Below is a list of all available parameters and what they do.. You can use **multiple parameters in a single command**, so mix and match to your liking.

<pre>Parameter Legend: (required) - &#60;optional&#62;</pre>

###### before <code>([message id](#how-do-i-get-a-discord-id) | message link | [timeframe](#what-is-a-timeframe))</code>
> Targets messages posted before the specified message id, message link or timeframe.

###### after <code>([message id](#how-do-i-get-a-discord-id) | message link | [timeframe](#what-is-a-timeframe))</code>
> Targets messages posted after the specified message id, message link or timeframe.

###### attachments `<extensions>`&emsp;&emsp;<samp>aliases: `files`</samp>
> Deletes messages with file attachments *(not images)*</br>
> Valid extensions are a fullstop followed by the extension, example: `.mov`

###### images `<extensions>`&emsp;&emsp;<samp>aliases: `imgs`</samp>
> Deletes messages with image attachments *(not files)*</br>
> Valid image extensions are `webp`, `png`, `jpg`, `jpeg` & `gif`

###### text `<quotes>`&emsp;&emsp;<samp>aliases: `txt`, `contains`</samp>
> Deletes messages with plain text, commands and emojis *(no embeds, no images, no files, etc..)*</br>
> If quotes are provided, then only messages containing the quotes will be targeted*</br>Valid quotes are any word/sentence enclosed in quotation marks, example `"hello world"`

###### commands `<prefixes>`&emsp;&emsp;<samp>aliases: `cmds`, `startsWith`</samp>
> Deletes messages that begin with the most common command symbols *(-, !!, /bb, etc..)*</br>
> If prefixes are provided, then only messages beginning with those prefixes will be targeted</br>Valid prefixes are any word/symbols enclosed in quotation marks, example `"!play"`

###### links `<urls>`
> Deletes messages that contain links</br>
> If urls are provided, then only messages containing those links will be targeted

###### embeds
> Deletes messages that contain embeds

###### bots
> Targets messages sent by other bots

###### purge
> Targets messages from users that no longer exist in the server *(kicked, banned, left, etc..)*

###### discord
> Deletes discord system messages *(welcome messages, pin added messages, etc..)*

###### invites
> Deletes discord invites

###### limit `(number)`&emsp;&emsp;<samp>aliases: `amount`</samp>
> Sets the maximum number of messages to be deleted</br>
> This parameter cannot be used by itself and must be paired with at least one other parameter from this list

###### all
> Targets messages of any kind, excluding pinned

###### pinned
> Deletes messages that are pinned
> 
###### @mentions
> Targets messages of the mentioned user or role</br>
> If a user has left the server but you still want to clean their messages without cleaning all other members who have left, [copy their user id](#how-do-i-get-a-discord-id) and type `<@!id>` (replacing id with the users id) as the response instead of a mention.

---

### FAQs

###### What is a timeframe?
> Timeframes are arguments only available to the `before` and `after` parameters. Timeframes are constructed by *numbers followed by a letter/work representing the duration*, example `1d` equals 1 day.</br></br>Timeframes can also be stacked on top of each other for more complicated timeframes, example `1d 20h 10m 30s` equals 1 day, 20 hours, 10 minutes and 30 seconds.

###### Discord bulk-delete limitation
> Unfortunately this bot *(like many others)* cannot delete messages older than 14 days in mass amounts, this is due to the discord api limiting the `bulk-delete` endpoint to only delete messages that do not exceed 14 days old.</br>

---

### Most Common Issues

###### I'm using the `purge` command but it's not working..
>  *This is a common misconception, `purge` is a parameter and should be added after the command `cleanup`. Example `.cleanup purge`*

###### Won't delete messages older than 14 days?
>  *We touched up on why this occurs earlier in the FAQs section, talking about [discord bulk-delete limitations](#discord-bulk-delete-limitation)*

###### I've added the bot to my server but it isn't working..
>  *There could be many number of reasons, the most common though is incorrect permissions inside the channel. Best way to check is make sure the bots (and any of it's roles) aren't denied access to manage messages inside the guild or the channel. If errors persist then feel free to stop by the support server linked below*

###### How do I get a discord id?
>  *Here is a great [support article](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) talking about how to copy ids from users, roles, messages, guilds, etc..*

#### Support Server
If you have any issues that aren't mentioned here, stop by our [support server](https://discord.gg/Gkdbyeh) and see if we can help there

[![Discord Server Banner](https://discordapp.com/api/guilds/417535126088450048/widget.png?style=banner2&theme=dark)](https://discord.gg/Gkdbyeh)