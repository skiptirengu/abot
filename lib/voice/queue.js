'use strict';

const youtubedl = require('youtube-dl');
const util = require('./../util');
const log = require('./../log');
const ASyncquence = require('a-syncquence');

const ytdlOptions = [
  '-f', 'bestaudio/best',
  '--skip-download'
];

let encoder;
let voice;
let musicQueue = new ASyncquence();

function parseUrl(video) {
  return new Promise((resolve, reject) => {
    youtubedl.getInfo(video, ytdlOptions, { maxBuffer: 7000 * 1024 }, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

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

function pushQueue(guild, playCallback) {
  musicQueue.push(function (callback) {
    getVoiceChannel(guild)
      .then(vc => vc.join())
      .then(vcInfo => playCallback(vcInfo, callback))
      .catch(err => {
        log.error(err);
        callback();
      });
  });
  musicQueue.onNext(next);
  musicQueue.onEnd(cleanupVoice);
  musicQueue.start();
}

function play(guild, input, ffmpegInputArgs) {
  ffmpegInputArgs = ffmpegInputArgs || [];
  pushQueue(guild, (vcInfo, callback) => {
    voice = vcInfo;
    encoder = voice.voiceConnection.createExternalEncoder({
      type: 'ffmpeg',
      format: 'pcm',
      source: input,
      debug: true,
      inputArgs: ffmpegInputArgs
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
    musicQueue = new ASyncquence();
  }
}

function queueUrl(msg, info) {
  play(msg.guild, info.url, [
    '-reconnect', 1,
    '-reconnect_streamed', 1,
    '-reconnect_delay_max', 5
  ]);
  return msg.channel.sendMessage(util.wrapCode(`${info.title} queued.`));
}

function next() {
  if (encoder) encoder.destroy();
}

module.exports = {
  run: function (msg, params) {
    return parseUrl(params.join(' '))
      .then((info) => queueUrl(msg, { title: info.title, url: info.url }))
      .then(() => msg.delete());
  },
  playUrl: function (msg, url) {
    return parseUrl(url)
      .then((info) => queueUrl(msg, { title: info.title, url: info.url }));
  },
  playFile: function (msg, file) {
    return Promise.resolve().then(() => play(msg.guild, file));
  },
  stop: function () {
    musicQueue.stop();
  },
  next: next,
  type: 'voice'
};
