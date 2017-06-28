'use strict';

const youtubedl = require('youtube-dl');
const { wrapCode } = require('./../util');
const log = require('./../log');
const ASyncquence = require('a-syncquence');

const ytdlOptions = [
  '-f', 'bestaudio/best',
  '--skip-download'
];

let encoder;
let voice;
let musicQueue = new ASyncquence();

function getVoiceChannel(guild) {
  return new Promise((resolve, reject) => {
    const channels = guild.voiceChannels;
    if (channels.length === 0) return reject('No voice channels.');
    const chan = channels.reduce((acc, cur) => {
      return cur.members.length > acc.members.length ? cur : acc;
    });
    resolve(chan);
  });
}

function pushQueue(guildId, playCallback) {
  musicQueue.push(function (callback) {
    getVoiceChannel(arrombot.client.Guilds.get(guildId))
      .then(vc => vc.join())
      .then(vcInfo => playCallback(vcInfo, callback))
      .catch(err => {
        log.error(err);
        callback();
      });
  });
  musicQueue.onNext(next);
  // setting a small timeout prevents the bot from
  // quitting too soon when playing short duration audios (∩ ͡° ͜ʖ ͡°)⊃━☆ﾟ*
  musicQueue.onEnd(() => setTimeout(cleanupVoice, 324));
  process.nextTick(() => musicQueue.start());
}

function play(guildId, input, inputArgs = [], outputArgs = []) {
  pushQueue(guildId, (vcInfo, callback) => {
    voice = vcInfo;
    encoder = voice.voiceConnection.createExternalEncoder({
      type: 'ffmpeg',
      format: 'pcm',
      source: input,
      debug: true,
      inputArgs: inputArgs,
      outputArgs: outputArgs
    });
    encoder.play();
    encoder.once('end', callback);
  });
}

function cleanupVoice() {
  if (voice) {
    voice.voiceConnection.disconnect();
    encoder = null;
    voice = null;
  }
}

function parseUrl(video) {
  return new Promise((resolve, reject) => {
    youtubedl.getInfo(video, ytdlOptions, { maxBuffer: 7000 * 1024 }, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

function queueUrl(msg, url) {
  return parseUrl(url).then(info => {
    play(msg.guild.id, info.url, [
      '-reconnect', 1,
      '-reconnect_streamed', 1,
      '-reconnect_delay_max', 5
    ]);
    return msg.channel.sendMessage(wrapCode(`${info.title} queued.`));
  });
}

function next() {
  if (encoder) encoder.destroy();
}

module.exports = {
  run: function (msg, params) {
    return queueUrl(msg, params.join('')).then(() => msg.delete());
  },

  playUrl: function (msg, url) {
    //TODO This MAY BE an issue. We're queuing the parsed url, which means
    //that we MIGHT hit an expired youtube url if the queue is too long
    return queueUrl(msg, url);
  },

  playFile: function (msg, file, outputArgs) {
    return Promise.resolve().then(() => play(msg.guild.id, file, [], outputArgs));
  },

  stop: function () {
    musicQueue.stop();
  },

  next: next,

  type: 'voice'
};
