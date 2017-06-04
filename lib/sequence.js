'use strict';

const EventEmitter = require('events');

class Sequence extends EventEmitter {

  constructor(delay) {
    super();
    /**
     * @type {Array}
     * @private
     */
    this._queue = [];
    /**
     * @type {boolean}
     * @private
     */
    this._running = false;
    /**
     * @type {number}
     * @private
     */
    this._delay = delay || 0;
  }

  /**
   * @param {Function} callback
   * @returns {Sequence}
   */
  push(callback) {
    this._queue.push(callback);
    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Sequence}
   */
  unshift(callback) {
    this._queue.unshift(callback);
    return this;
  }

  start() {
    if (this._running) return;
    Promise.resolve().then(() => {
      this.run();
    }).catch((err) => {
      this.emit('error', err);
    });
  }

  run() {
    const current = this._queue.shift();
    const next = () => {
      if (this._delay) {
        setTimeout(() => this.run(), this._delay);
      } else {
        this.run();
      }
    };

    if (current == undefined) {
      this._running = false;
      this.emit('end');
    } else {
      this._running = true;
      current(next);
    }
  }

  /**
   * @param {*} cb
   * @return {Sequence}
   */
  onEnd(cb) {
    if (!this._isBinded('end')) this.on('end', cb);
    return this;
  }

  /**
   * @param {*} cb
   * @return {Sequence}
   */
  onError(cb) {
    if (!this._isBinded('error')) this.on('error', cb);
    return this;
  }

  /**
   * @param {*} cb
   * @return {Sequence}
   */
  onNext(cb) {
    if (!this._isBinded('next')) this.on('next', cb);
    return this;
  }

  /**
   * @param {String} event
   * @return {boolean}
   * @private
   */
  _isBinded(event) {
    return this.listenerCount(event) > 0;
  }

  next() {
    this.emit('next');
  }

  /**
   * @returns {boolean}
   */
  isRunning() {
    return this._running;
  }

  /**
   * @return {Sequence}
   */
  clear() {
    this._queue.splice(0, this._queue.length);
    return this;
  }

  stop() {
    this.clear();
    this.next();
  }

  /**
   * @return {Number}
   */
  count() {
    return this._queue.length;
  }
}

module.exports = Sequence;