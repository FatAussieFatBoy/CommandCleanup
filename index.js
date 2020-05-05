const { ShardingManager } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const ConsoleHandler = require('./src/util/ConsoleHandler');

const path = require('path');

const manager = new ShardingManager(path.join(__dirname, 'app.js'), { token: token, totalShards: 'auto', respawn: true });

manager.on('shardCreate', function(shard) {
    ConsoleHandler.log(shard, `Shard ${shard.id + 1}/${parseInt(manager.totalShards)} initiating..`);

    shard.on('death', function() {
        ConsoleHandler.error(shard, `Shard ${shard.id} died..`);
    });

    shard.on('disconnect', function() {
        ConsoleHandler.debug(shard, `Shard ${shard.id} disconnected..`);
    });

    shard.on('reconnecting', function() {
        ConsoleHandler.debug(shard, `Shard ${shard.id} reconnecting..`);
    });

    shard.on('close', function(code) {
        ConsoleHandler.error(shard, `Shard ${shard.id} closed all stdio with code ${code}`);
    });

    shard.on('exit', function(code) {
        ConsoleHandler.error(shard, `Shard ${shard.id} exited with code ${code}`);
    });

    shard.on('message', function(data) {
        if (data instanceof Object && typeof data == "object") {
            if (!data.message || !data.type) ConsoleHandler.log(shard, data.message||data);
            switch(data.type) {
                case 'debug':
                    ConsoleHandler.debug(shard, data.message);
                    break;

                case 'warn':
                    ConsoleHandler.warn(shard, data.message);
                    break;

                case 'error':
                    ConsoleHandler.error(shard, data.message);
                    break;

                default:
                    ConsoleHandler.log(shard, data.message);
            }
        } else {
            ConsoleHandler.log(shard, data);
        }
    });
});

manager.spawn(manager.totalShards).catch(console.error);