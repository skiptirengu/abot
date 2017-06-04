const youtubedl = require('youtube-dl');
const PromiseQueue = require('promise-queue');
const log = require('./../log');
const util = require('./../util');

let encoder;
const musicQueue = new PromiseQueue(1, Infinity);
const defaultYtdlOpts = [
  '-f', 'bestaudio/worst',
  '--skip-download'
];

function parseUrl(video) {
  return new Promise((resolve, reject) => {
    youtubedl.getInfo(video, defaultYtdlOpts, { maxBuffer: 7000 * 1024 }, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

function play(chan, info) {
  musicQueue.add(function () {
    return new Promise((resolve, reject) => {
      chan.join()
        .then(vc => {
          encoder = vc.voiceConnection.createExternalEncoder({
            type: 'ffmpeg',
            format: 'pcm',
            source: info.url
          });
          encoder.play();
          encoder.once('end', () => resolve(vc));
        })
        .catch(reject);
    })
      .then((vc) => {
        encoder = null;
        return vc.voiceConnection.disconnect();
      });
  });
}

function addQueue(msg, info) {
  const chan = msg.member.getVoiceChannel();
  if (chan === null) {
    const resp = 'You need to enter a voice channel to use this command.';
    return msg.channel.sendMessage(util.wrapCode(resp));
  }
  play(chan, info);
  return msg.channel.sendMessage(util.wrapCode(`${info.title} added to the music queue.`));
}

module.exports = {
  run: function (msg, params) {
    return parseUrl(params.join(' ')).then((info) => addQueue(msg, info));
  },
  append: function (url, msg) {
    return parseUrl(url).then((info) => addQueue(msg, info));
  },
  stop: function () {
    musicQueue.queue = [];
    this.next();
  },
  next: function () {
    if (encoder) encoder.destroy();
  }
}