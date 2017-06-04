const youtubedl = require('youtube-dl');
const PromiseQueue = require('promise-queue');
const util = require('./../util');

const defaultYtdlOpts = [
  '-f', 'best',
  '--skip-download'
];
const ffmpegInput = [
  '-reconnect', 1,
  '-reconnect_streamed', 1,
  '-reconnect_delay_max', 5
];

const musicQueue = new PromiseQueue(1, Infinity);
let encoder;

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
            source: info.url,
            debug: true,
            inputArgs: ffmpegInput
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
  return msg.channel.sendMessage(util.wrapCode(`${info.title} queued.`));
}

module.exports = {
  run: function (msg, params) {
    return parseUrl(params.join(' '))
      .then((info) => {
        return addQueue(msg, info);
      })
      .then(() => {
        return msg.delete();
      });
  },
  append: function (url, msg) {
    return parseUrl(url)
      .then((info) => {
        return addQueue(msg, info);
      });
  },
  stop: function () {
    musicQueue.queue = [];
    this.next();
  },
  next: function () {
    if (encoder) encoder.destroy();
  }
};
