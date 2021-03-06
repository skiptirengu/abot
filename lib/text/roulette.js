'use strict';

let currentSlot = 0;
let bulletSlot = null;

function reset() {
  currentSlot = 0;
  bulletSlot = null;
}

function nextSlot() {
  return currentSlot++;
}

function getBulletSlot() {
  if (bulletSlot === null) bulletSlot = Math.floor(Math.random() * 5);
  return bulletSlot;
}

module.exports = {
  run: function (msg) {
    let content = `${msg.author.mention} pulled the trigger and... `;
    if (currentSlot === getBulletSlot()) {
      content += 'The gun fired! Press f to pay respects :cry:';
      reset();
    } else {
      content += 'Nothing happened :ok_hand:';
      nextSlot();
    }
    return msg.channel.sendMessage(content);
  },

  usage: function () {
    return {
      description: 'Give it a shot (hehe) on the russian roulette.',
    };
  },

  type: 'text'
};
