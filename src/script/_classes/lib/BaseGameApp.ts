"use strict";
import StorageFile = require("./StorageFile");
import WebStory = require("./WebStory/WebStory");
import Teller = require("./WebStory/Teller");
import Chooser = require("./WebStory/Chooser");
import Diverter = require("./WebStory/Diverter");
import Chapter = require("./WebStory/Chapter");
import Music = require("./WebStory/Music");
import Game = require("./WebStory/Game/Game");
import Sound = require("./WebStory/Game/Sound");


if (!Element.prototype.requestFullscreen) {
    Element.prototype.requestFullscreen = 
        Element.prototype["webkitRequestFullscreen"] || 
        Element.prototype["mozRequestFullScreen"] ||
        Element.prototype["msRequestFullscreen"];
}

/**
 * BaseGameApp class
 * 
 * @date 27-02-2017
 */

class BaseGameApp {
  public story:WebStory;
  public saveFile = new StorageFile("save.json");
  public prefs = new StorageFile("/prefs.json");

  constructor(storyElement: string, displayElement=storyElement) {
    this.prefs.onSet("ambiance", this.applySoundPrefs.bind(this));
    this.prefs.onSet("music", this.applySoundPrefs.bind(this));
    this.prefs.onSet("sfx", this.applySoundPrefs.bind(this));
    this.prefs.set("ambiance.enabled", true, true);
    this.prefs.set("ambiance.volume", 0.25, true);
    this.prefs.set("music.enabled", true, true);
    this.prefs.set("music.volume", 0.5, true);
    this.prefs.set("sfx.enabled", true, true);
    this.prefs.set("sfx.volume", 1, true);
    this.prefs.set("fullscreen", true, true);
    this.applySoundPrefs();
    
    this.story = new WebStory(storyElement, displayElement);
    this.story.addTeller("p", Teller);
    this.story.addTeller("ul, ol", Chooser);
    this.story.addTeller("pre", Diverter);
    this.story.addTeller("article", Chapter);
    this.story.addTeller("audio", Music);
    this.story.addTeller("canvas", Game);
    this.story.passageSelector = ".passage";
    this.story.choiceSelector = "li";
  }

  goFullscreen() {
    document.body.parentElement.requestFullscreen();
  }

  applySoundPrefs() {
    Music.enabled["ambiance"] = this.prefs.get("ambiance.enabled");
    Music.volumes["ambiance"] = this.prefs.get("ambiance.volume");
    Music.enabled["music"] = this.prefs.get("music.enabled");
    Music.volumes["music"] = this.prefs.get("music.volume");
    Music.enabled["sfx"]   = this.prefs.get("sfx.enabled");
    Music.volumes["sfx"]   = this.prefs.get("sfx.volume");
    Sound.enabled          = this.prefs.get("sfx.enabled");
    Sound.volume           = this.prefs.get("sfx.volume");
  }
}
export = BaseGameApp;
