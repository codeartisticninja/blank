"use strict";


/**
 * Sound class
 * 
 * @date 7-apr-2017
 */

class Sound {
  static enabled=true;
  static volume=1;
  static ctx:AudioContext;
  gainNode:GainNode;
  mainNode:AudioNode;
  file:string;
  source:AudioBufferSourceNode;
  buffer:AudioBuffer;
  marks = {};
  oneInstance:boolean;

  constructor(src:string) {
    if (!Sound.ctx) {
      Sound.ctx = new (window["AudioContext"] || window["webkitAudioContext"])();
    }
    this.gainNode = Sound.ctx.createGain();
    this.gainNode.gain.value = Sound.volume;
    this.gainNode.connect(Sound.ctx.destination);
    this.mainNode = this.gainNode;

    this.setMark("_all", 0);
    this.load(src, ()=>{
      if (this._playOnLoad) {
        this.play(this._playOnLoad);
      }
    });
  }

  load(src=this.file, cb?:Function) {
    if (!Sound.enabled) return;
    this.file = src;
    var req = new XMLHttpRequest();
    req.open("GET", src, true);
    req.responseType = "arraybuffer";
    req.onload = () => {
      var data = req.response;
      Sound.ctx.decodeAudioData(data, (buffer)=>{
        this.buffer = buffer;
        cb && cb();
      });
    }
    req.send();
  }

  play(mark="_all") {
    if (this.source && this.oneInstance) {
      this.source.stop();
    }
    if (!this.buffer) {
      this._playOnLoad = mark;
      return;
    }
    this.source = Sound.ctx.createBufferSource();
    this.source.connect(this.mainNode);
    this.source.buffer = this.buffer;
    this.source.start(0, this.marks[mark].start, this.marks[mark].duration);
    this._playOnLoad=null;
  }

  stop() {
    if (this.source) {
      this.source.stop();
    }
    this._playOnLoad=null;
  }

  setMark(name:string, start:number, duration?:number) {
    this.marks[name] = {
      start: start,
      duration: duration
    };
  }


  /*
    _privates
  */
  private _playOnLoad:string;
}
export = Sound;
