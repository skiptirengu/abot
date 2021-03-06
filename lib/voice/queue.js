'use strict';

const youtubedl = require('youtube-dl');
const { wrapCode, guildTag } = require('./../util');
const log = require('./../log');
const ASyncquence = require('a-syncquence');

const ytdlOptions = ['-f', 'bestaudio/best', '--skip-download', '--force-ipv4', '--external-downloader', 'curl'];

/**
 * guildId -> VoiceConnectionInfo
 */
const voiceMap = {};
/**
 * guildId -> ASyncquence
 */
const queueMap = {};

function getGuild(guildId) {
  return arrombot.client.Guilds.get(guildId);
}

function getQueue(guild) {
  return queueMap[guild] || (queueMap[guild] = new ASyncquence());
}

function getJoinedVoiceChannel(guildId) {
  return getGuild(guildId).voiceChannels.find(chan => chan.joined);
}

function getVoiceChannel(guildId, userId) {
  return new Promise((resolve, reject) => {
    let chan;
    if (!(chan = getJoinedVoiceChannel(guildId))) {
      const user = getGuild(guildId).members.find(u => u.id === userId);
      if (!user) return reject(`User ${userId} not found.`);
      chan = user.getVoiceChannel();
      if (!chan) return reject(`User ${user.name} not connected to any voice channel.`);
    }
    resolve(chan.id);
  });
}

function findVoiceChannel(guildId, chanId) {
  return new Promise((resolve, reject) => {
    const chan = getGuild(guildId).voiceChannels.find(c => c.id === chanId);
    if (!chan) return reject(`Unable to find channel ${chanId}.`);
    resolve(chan);
  });
}

function pushQueue(chanId, guildId, playCallback) {
  const musicQueue = getQueue(guildId);
  musicQueue.push(function (callback) {
    findVoiceChannel(guildId, chanId)
      .then(vc => vc.join())
      .then(vcInfo => playCallback(vcInfo, callback))
      .catch(err => {
        log.error(err);
        callback();
      });
  });
  musicQueue.onNext(() => {
    log.info({ tag: guildTag(guildId), message: 'Received next. Skipping...' });
    next(guildId);
  });
  musicQueue.onError(err => {
    log.error({ tag: guildTag(guildId), message: 'Music queue error.' }, err);
    next(guildId);
  });
  // setting a small timeout prevents the bot from
  // quitting too soon when playing short duration audios (∩ ͡° ͜ʖ ͡°)⊃━☆ﾟ*
  musicQueue.onEnd(() => setTimeout(cleanupVoice, 324, guildId));
  musicQueue.start();
  return Promise.resolve();
}

function play(chanId, guildId, input, times = 1, inputArgs = [], outputArgs = []) {
  pushQueue(chanId, guildId, (vcInfo, callback) => {
    voiceMap[guildId] = vcInfo;
    const encoder = vcInfo.voiceConnection.createExternalEncoder({
      type: 'ffmpeg',
      format: 'pcm',
      source: input,
      debug: true,
      inputArgs: inputArgs,
      outputArgs: outputArgs,
      encoderEngine: 'native'
    });
    encoder.play();
    log.info({ tag: guildTag(guildId), message: 'Spawned new ffmpeg encoder.' });

    let ended = false;
    const endCallback = () => {
      if (!ended) {
        ended = true;
        log.info({ tag: guildTag(guildId), message: 'Ended! ffmpeg encoder exited.' });
        callback();
      }
    };
    encoder.once('unpipe', endCallback);
    encoder.once('end', endCallback);
  }).then(() => {
    // decrease counter
    times -= 1;
    // and keep queueing until we hit the end
    if (times > 0) play(chanId, guildId, input, times, inputArgs, outputArgs);
  }).catch(err => {
    log.error(err);
  });
}

function cleanupVoice(guildId) {
  const voice = voiceMap[guildId];
  if (voice !== undefined) {
    try {
      voice.voiceConnection.disconnect();
    } catch (err) {
      log.error(err);
    } finally {
      process.nextTick(() => {
        log.info({ tag: guildTag(guildId), message: 'Cleaning up voice connection.' });
        delete voiceMap[guildId];
        delete queueMap[guildId];
      });
    }
  }
}

function parseUrl(video) {
  return new Promise((resolve, reject) => {
    const cmdOpts = { maxBuffer: 7000 * 1024 };
    youtubedl.getInfo(video, ytdlOptions, cmdOpts, (err, info) => err ? reject(err) : resolve(info));
  });
}

function queueUrl(msg, url, times) {
  let chan;
  if ((times = times || 1) > 10) times = 10;
  return getVoiceChannel(msg.guild.id, msg.member.id)
    .then((chanId) => chan = chanId)
    .then(() => parseUrl(url))
    .then(info => {
      play(chan, msg.guild.id, info.url, times, [
        '-reconnect', 1,
        '-reconnect_streamed', 1,
        '-reconnect_delay_max', 5
      ]);
      let message = `${info.title} queued.`;
      if (times > 1) {
        message = `${info.title} queued ${times} times.`;
      }
      return msg.channel.sendMessage(wrapCode(message));
    });
}

function next(guild) {
  const voice = voiceMap[guild];
  if (voice !== undefined) {
    try {
      let stream = voice.voiceConnection.getEncoder();
      if (stream) stream.kill();
    } catch (err) {
      log.error(err);
    }
  }
}

module.exports = {
  run: function (msg, params) {
    let repeat;
    if (params.length !== 2 || isNaN(repeat = parseInt(params[1]))) {
      repeat = 1;
    }
    return queueUrl(msg, params[0], repeat).then(() => msg.delete());
  },

  usage: function () {
    return {
      title: '<url> [<repeat-x-times>]',
      description: 'Adds a music to the play queue, being "**url**" an youtube video id or any valid link. Check [this](https://rg3.github.io/youtube-dl/supportedsites.html) for a complete list of the 1000+ supported sites.',
      fields: [
        { name: 'Example:', value: '`!queue http://my.video.com/xD.mp4`', inline: true },
        { name: 'Or:', value: '`!queue dQw4w9WgXcQ 4`', inline: true }
      ]
    };
  },

  playUrl: function (msg, url, times) {
    //TODO This MAY BE an issue. We're queuing the parsed url, which means
    //that we MIGHT hit an expired youtube url if the queue is too long
    return queueUrl(msg, url, times);
  },

  playFile: function (msg, file, outputArgs) {
    return getVoiceChannel(msg.guild.id, msg.member.id)
      .then((chanId) => play(chanId, msg.guild.id, file, 1, [], outputArgs));
  },

  stop: function (guildId) {
    getQueue(guildId).stop();
  },

  next: function (guildId) {
    getQueue(guildId).next();
  },

  joinChannel: function (channel) {
    if (!channel || !voiceMap[channel.guild_id]) return Promise.resolve();
    return channel.join();
  },

  type: 'voice'
};
