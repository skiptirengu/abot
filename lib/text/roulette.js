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
    let content = 'Puxou o gatilho e... '
    if (currentSlot === getBulletSlot()) {
      content += 'A arma disparou! Press f to pay respects :cry:';
      reset();
    } else {
      content += "Nada aconteceu :ok_hand:";
      nextSlot();
    }
    return msg.channel.sendMessage(content);
  }
};
