var FlashingButtons = require('flashing_buttons').FlashingButtons;
var Programmer = require('./programmer.js').Programmer;

var ProgrammerManager = function(hex_file, config){
  this.hex_file = hex_file;
  this.config = config;
  this.start();
  this.programmerStates = [];
}

var p = ProgrammerManager.prototype;

p.start = function(){
  var self = this;
  this.fb = new FlashingButtons({
    port: this.config.UIPort,
    baud: 57600
  });
  this.fb.on('connect', function(){ self.flashLeds(); });
  this.fb.on('error', function(err){
    console.log("Error from UI");
    console.log(err);
  });
  this.fb.on('release', function(details){ self.handlePress(details); });
}

p.handlePress = function(details){
  var self = this;
  if(details.button < this.config.ArduinoPorts.length){
    if(self.programmerStates[details.button] !== 'programming'){
      var prog = new Programmer({hex_file: self.hex_file, port: self.config.ArduinoPorts[details.button], baud: 57600});
      prog.on('start', function(){
        self.programmerStates[details.button] = 'programming';
        self.fb.setLed(details.button, 'FLASH', function(){});
      });
      prog.on('error', function(err){
        self.programmerStates[details.button] = 'complete';
        self.fb.setLed(details.button, 'OFF', function(){});
      });
      prog.on('complete', function(err){
        self.programmerStates[details.button] = 'complete';
        self.fb.setLed(details.button, 'ON', function(){});
      });
      prog.program();
    }
  }else{
    console.log("Error: no programmer on this button");
  }
}

p.flashLeds = function(led){
  var self = this;
  if(typeof led === 'undefined'){
    this.flashLeds(0);
  }else{
    var nextOn = function(){
      self.fb.setLed(led, 'ON', function(){
        setTimeout(function(){
          self.flashLeds(++led);
        }, 100);
      });
    }
    if(led > 0){
      if(led < (self.fb.buttonCount - 1)){
        this.fb.setLed(led - 1, 'OFF', nextOn);
      }else{
        this.fb.setLed(led - 1, 'OFF', function(){});
      }
    }else{
      nextOn();
    }
  }
}

exports.ProgrammerManager = ProgrammerManager;