const youtubedl = require('youtube-dl');
const util = require('./../util');
const log = require('./../log');
const ASyncquence = require('a-syncquence');

const defaultYtdlOpts = [
  '-f', 'best',
  '--skip-download'
];
const ffmpegInput = [
  '-reconnect', 1,
  '-reconnect_streamed', 1,
  '-reconnect_delay_max', 5
];

let encoder;
let voice;
let musicQueue = new ASyncquence();

function parseUrl(video) {
  return new Promise((resolve, reject) => {
    youtubedl.getInfo(video, defaultYtdlOpts, { maxBuffer: 7000 * 1024 }, (err, info) => {
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

function play(guild, info) {
  musicQueue.push(function (callback) {
    getVoiceChannel(guild)
      .then(vc => vc.join())
      .then(vcInfo => {
        voice = vcInfo;
        encoder = voice.voiceConnection.createExternalEncoder({
          type: 'ffmpeg',
          format: 'pcm',
          source: info.url,
          debug: true,
          inputArgs: ffmpegInput
        });
        encoder.play();
        encoder.once('end', callback);
      })
      .catch(err => {
        log.error(err);
        callback();
      });
  });
  musicQueue.onEnd(cleanupVoice);
  musicQueue.onNext(next);
  musicQueue.start();
}

function cleanupVoice() {
  if (voice) {
    voice.voiceConnection.disconnect();
    encoder = null;
    voice = null;
  }
}

function addQueue(msg, info) {
  play(msg.guild, info);
  return msg.channel.sendMessage(util.wrapCode(`${info.title} queued.`));
}

function next() {
  if (encoder) encoder.destroy();
}

module.exports = {
  run: function (msg, params) {
    return parseUrl(params.join(' '))
      .then((info) => addQueue(msg, { title: info.title, url: info.url }))
      .then(() => msg.delete());
  },
  append: function (url, msg) {
    return parseUrl(url)
      .then((info) => addQueue(msg, { title: info.title, url: info.url }));
  },
  stop: function () {
    musicQueue.stop();
  },
  type: 'voice',
  next: next
};
