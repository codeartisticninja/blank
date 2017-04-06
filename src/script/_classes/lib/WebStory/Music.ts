"use strict";
import Teller = require("./Teller");
import WebStory = require("./WebStory");


/**
 * Music class
 * 
 * @date 6-apr-2017
 */

class Music extends Teller {
  audio:HTMLAudioElement;
  channel:string;
  static volumes:Object = {};
  static enabled:Object = {};

  constructor(story:WebStory, element:HTMLElement) {
    super(story, element);
    this.audio = <HTMLAudioElement>this.element;
    this.channel = this.audio.classList.item(0);
  }

  init() {
    var auds = this.story.rootDisplayElement.querySelectorAll("audio."+this.channel);
    var snd:Music, aud:HTMLAudioElement;
    for (var i=0;i<auds.length;i++) {
      aud = <HTMLAudioElement>auds.item(i);
      snd = <Music>this.getTellerFromElement(aud);
      snd.fadeOut();
    }
    if (Music.enabled[this.channel] == null || Music.enabled[this.channel]) {
      if (Music.volumes[this.channel]) this.audio.volume = Music.volumes[this.channel];
      this.registerToElement();
      this.appendElement();
      this.audio.play();
    } else {
      this.audio = null;
    }
    this.hurry();
  }

  fadeOut() {
    if (this.audio.volume > .01) {
      this.audio.volume -= .0075;
      requestAnimationFrame(this.fadeOut.bind(this));
    } else {
      this.audio.pause();
      this.removeElement();
    }
  }

  hurry() {
    if (this.audio && this.audio.src && this.audio.paused) {
      this.audio.play();
      if (!this._tapEl) {
        this._tapEl = document.createElement("p");
        this._tapEl.textContent = "(tap to continue)";
        this.story.appendElement(this._tapEl);
      }
      setTimeout(()=>{ this.hurry(); }, 1024);
    } else {
      if (this._tapEl) this._tapEl.parentElement.removeChild(this._tapEl);
      super.hurry();
      this.story.impatience = 0;
    }
  }

  /*
    _privates
  */
  private _tapEl:HTMLElement;

}
export = Music;
