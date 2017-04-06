"use strict";
import BaseGameApp = require("./lib/BaseGameApp");
import MadLipper = require("./tellers/MadLipper");



/**
 * GameApp class
 */

class GameApp extends BaseGameApp {

  constructor(storyElement: string, displayElement=storyElement) {
    super(storyElement, displayElement);
    this.story.addTeller("p", MadLipper);
    this.story.scrollInertia = 1;
    this.initLauchSettings();
  }

  initLauchSettings() {
    var form = document.getElementById("launchSettings");
    var html = "<p>";
    // html += '<span><input id="ambianceChk" type="checkbox" /> <label for="ambianceChk">Ambiance</label></span> ';
    // html += '<span><input id="musicChk" type="checkbox" /> <label for="musicChk">Music</label></span> ';
    html += '<span><input id="sfxChk" type="checkbox" /> <label for="sfxChk">Sound effects</label></span> ';
    // html += '<span><input id="fullscreenChk" type="checkbox" /> <label for="fullscreenChk">Full screen</label></span> ';
    html += '</p><p><button>New document</button></p>';
    form.innerHTML = html;

    var checkbox:HTMLInputElement;
    checkbox = <HTMLInputElement>form.querySelector("#ambianceChk");
    if (checkbox) checkbox.checked = this.prefs.get("ambiance.enabled");
    checkbox = <HTMLInputElement>form.querySelector("#musicChk");
    if (checkbox) checkbox.checked = this.prefs.get("music.enabled");
    checkbox = <HTMLInputElement>form.querySelector("#sfxChk");
    if (checkbox) checkbox.checked = this.prefs.get("sfx.enabled");
    checkbox = <HTMLInputElement>form.querySelector("#fullscreenChk");
    if (checkbox) checkbox.checked = this.prefs.get("fullscreen");

    var startBtn = form.querySelector("button");
    startBtn.addEventListener("click", this.start.bind(this));

    requestAnimationFrame(()=>{
      startBtn.focus();
    });
    (<HTMLElement>document.querySelector("#display")).style.display = "none";
  }

  start(e:Event) {
    e.preventDefault();
    var form = document.getElementById("launchSettings");
    var startBtn = form.querySelector("button");
    startBtn.disabled = true;
    (<HTMLElement>document.querySelector("#display")).removeAttribute("style");

    var checkbox:HTMLInputElement;
    checkbox = <HTMLInputElement>form.querySelector("#ambianceChk");
    if (checkbox) this.prefs.set("ambiance.enabled", checkbox.checked);
    checkbox = <HTMLInputElement>form.querySelector("#musicChk");
    if (checkbox) this.prefs.set("music.enabled", checkbox.checked);
    checkbox = <HTMLInputElement>form.querySelector("#sfxChk");
    if (checkbox) this.prefs.set("sfx.enabled", checkbox.checked);
    checkbox = <HTMLInputElement>form.querySelector("#fullscreenChk");
    if (checkbox) this.prefs.set("fullscreen", checkbox.checked);

    /* if (this.prefs.get("fullscreen")) {
      this.goFullscreen();
    } */
    this.story.impatience = 0;
    this.story.continue();
  }
}
export = GameApp;
