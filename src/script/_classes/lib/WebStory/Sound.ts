"use strict";
import Teller = require("./Teller");
import WebStory = require("./WebStory");


/**
 * Sound class
 * 
 * @date 02-mar-2017
 */

class Sound extends Teller {
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
    var snd:Sound, aud:HTMLAudioElement;
    for (var i=0;i<auds.length;i++) {
      aud = <HTMLAudioElement>auds.item(i);
      snd = <Sound>this.getTellerFromElement(aud);
      snd.fadeOut();
    }
    if (Sound.enabled[this.channel] == null || Sound.enabled[this.channel]) {
      if (Sound.volumes[this.channel]) this.audio.volume = Sound.volumes[this.channel];
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
export = Sound;
