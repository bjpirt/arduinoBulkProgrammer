var EventEmitter = require("events").EventEmitter;
var util         = require("util");
var spawn        = require('child_process').spawn;

var Programmer = function(config){
  this.config = config;
  EventEmitter.call(this);
}

util.inherits(Programmer, EventEmitter);

var p = Programmer.prototype;

p.program = function(){
  var self = this;
  var args = ['-patmega328p', '-carduino', '-P' + this.config.port, '-b', this.config.baud, '-D', '-Uflash:w:' + this.config.hex_file + ':i'];
  this.cmd = spawn('avrdude', args);
  self.emit('start');
  this.cmd.on('close', function (code) {
    if(code === 0){
      self.emit('complete');
    } else {
      self.emit("error", {msg: "avrdude exited with non-zero return code"});
    }
    self.cmd.stdin.end();
  });
  this.cmd.on('error', function (err) {
    console.log(err);
    self.emit('error', err);
  });
}

exports.Programmer = Programmer;