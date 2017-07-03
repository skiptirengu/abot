'use strict';

const youtubedl = require('youtube-dl');
const { wrapCode } = require('./../util');
const log = require('./../log');
const ASyncquence = require('a-syncquence');

const ytdlOptions = ['-f', 'bestaudio/best', '--skip-download'];

/**
 * guildId -> VoiceConnectionInfo
 */
const voiceMap = {};
/**
 * guildId -> ASyncquence
 */
const queueMap = {};
/**
 * guildId -> FFmpegEncoder
 */
const encdrMap = {};

function getQueue(guild) {
  return queueMap[guild] || (queueMap[guild] = new ASyncquence());
}

function getVoiceChannel(guildId, userId) {
  return new Promise((resolve, reject) => {
    const user = arrombot.client.Guilds.get(guildId).members.find(u => u.id === userId);
    if (!user) return reject(`User ${userId} not found on guild ${guildId}.`);
    const chan = user.getVoiceChannel();
    if (!chan) return reject(`User ${user.name} not connected to any voice channel on guild ${guildId}.`);
    resolve(chan.id);
  });
}

function findVoiceChannel(guildId, chanId) {
  return new Promise((resolve, reject) => {
    const chan = arrombot.client.Guilds.get(guildId).voiceChannels.find(c => c.id === chanId);
    if (!chan) return reject(`Unable to find channel ${chanId} on guild ${guildId}`);
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
  musicQueue.onNext(() => next(guildId));
  // setting a small timeout prevents the bot from
  // quitting too soon when playing short duration audios (∩ ͡° ͜ʖ ͡°)⊃━☆ﾟ*
  musicQueue.onEnd(() => setTimeout(cleanupVoice, 324, guildId));
  process.nextTick(() => musicQueue.start());
}

function play(chanId, guildId, input, inputArgs = [], outputArgs = []) {
  pushQueue(chanId, guildId, (vcInfo, callback) => {
    voiceMap[guildId] = vcInfo;
    const encoder = vcInfo.voiceConnection.createExternalEncoder({
      type: 'ffmpeg',
      format: 'pcm',
      source: input,
      debug: true,
      inputArgs: inputArgs,
      outputArgs: outputArgs
    });
    encdrMap[guildId] = encoder;
    encoder.play();
    encoder.once('end', callback);
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

function queueUrl(msg, url) {
  let chan;
  return getVoiceChannel(msg.guild.id, msg.member.id)
    .then((chanId) => chan = chanId)
    .then(() => parseUrl(url))
    .then(info => {
      play(chan, msg.guild.id, info.url, [
        '-reconnect', 1,
        '-reconnect_streamed', 1,
        '-reconnect_delay_max', 5
      ]);
      return msg.channel.sendMessage(wrapCode(`${info.title} queued.`));
    });
}

function next(guild) {
  const encoder = encdrMap[guild];
  if (encoder !== undefined) {
    try {
      encoder.destroy();
    } catch (err) {
      log.error(err);
    } finally {
      process.nextTick(() => delete encdrMap[guild]);
    }
  }
}

module.exports = {
  run: function (msg, params) {
    return queueUrl(msg, params.join('')).then(() => msg.delete());
  },

  usage: function () {
    return {
      title: '<url>',
      description: 'Adds a music to the play queue, being "**url**" an youtube video id or any valid link. Check [this](https://rg3.github.io/youtube-dl/supportedsites.html) for a complete list of the 1000+ supported sites.',
      fields: [
        { name: 'Example:', value: '`!queue http://my.video.com/xD.mp4`', inline: true },
        { name: 'Or:', value: '`!queue dQw4w9WgXcQ`', inline: true }
      ]
    };
  },

  playUrl: function (msg, url) {
    //TODO This MAY BE an issue. We're queuing the parsed url, which means
    //that we MIGHT hit an expired youtube url if the queue is too long
    return queueUrl(msg, url);
  },

  playFile: function (msg, file, outputArgs) {
    return getVoiceChannel(msg.guild.id, msg.member.id)
      .then((chanId) => play(chanId, msg.guild.id, file, [], outputArgs));
  },

  stop: function (guildId) {
    getQueue(guildId).stop();
  },

  next: function (guildId) {
    next(guildId);
  },

  type: 'voice'
};
