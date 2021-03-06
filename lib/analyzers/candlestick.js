var inherits = require("util").inherits;
var EventEmitter = require("events");
var moment = require("moment");

inherits(CandleStick, EventEmitter);

// resolution: time in ms
function CandleStick(resolution) {
  CandleStick.super_.call(this);
  resolution = (resolution || "5 minutes").split(" ");

  if (resolution.length > 0) {
    resolution[0] = parseInt(resolution[0]);
  }

  this.resolution = moment.duration.apply(moment.duration, resolution).asMilliseconds();
  this.history = [];
  this.last_id = -1;
  this.history_length = 20;
};

CandleStick.prototype.reset = function() {
  this.history = [];
};

CandleStick.prototype.new_candle = function(options) {
  this.last_id += 1;

  var candle = {
    open: options.price,
    close: options.price,
    high: options.price,
    low: options.price,
    last: options.price,
    open_timestamp: options.timestamp,
    last_timestamp: options.timestamp,
    price_events: [],
    id: this.last_id
  };

  candle.price_events.push(options);

  this.history.push(candle);

  if (this.history.length > this.history_length) {
    this.history.shift()
  }

  //this.emit("new_candle", candle);

  return candle;
}

CandleStick.prototype.update_candle = function(options) {
  var candle = this.last_candle();

  candle.high = Math.max(candle.high, options.price);
  candle.low = Math.min(candle.low, options.price);
  candle.close = options.price;
  candle.last = options.price;
  candle.last_timestamp = options.timestamp;
  candle.price_events.push(options);
};

CandleStick.prototype.last_candle = function() {
  return this.history[this.history.length - 1];
}

CandleStick.prototype.get_candles = function(amount) {
  return this.history.slice(amount * -1);
};

CandleStick.prototype.tick = function(options) {
  var candle;

  if (this.history.length == 0) {
    candle = this.new_candle(options);
  } else {
    candle = this.last_candle();
  }

  if (options.timestamp >= candle.open_timestamp + this.resolution) {
    this.emit("candle_closed", candle);
    this.new_candle(options);
  } else {
    this.update_candle(options);
  }
};

module.exports = CandleStick;
