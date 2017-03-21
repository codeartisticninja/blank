"use strict";
import WebStory = require("./WebStory");


/**
 * Teller class
 * 
 * @date 21-mar-2017
 */

var tellers:Teller[] = [];

class Teller {
  public interval:number;

  constructor(public story:WebStory, public element:HTMLElement) {
    this.hurry = this.hurry.bind(this);
    this.interval = this.story.impatience ? 128 : (this.story.get("_interval") || Math.max(element.textContent.length*80, 1024));
  }

  init() {
    this.appendElement();
    this.wait();
  }

  wait(interval=this.interval) {
    this.interval=interval;
    if (this.interval > -1) {
      this._hurryTO = setTimeout(this.hurry, this.interval);
    }
  }

  pause() {
    clearTimeout(this._hurryTO);
  }

  goOn() {
    if (this.interval === -1) {
      this.hurry();
    }
  }

  hurry() {
    this.story.continue(this);
  }

  appendElement() {
    return this.story.appendElement(this.element);
  }

  removeElement() {
    if (this.element.dataset["_teller"]) {
      tellers[parseInt(this.element.dataset["_teller"])] = null;
      this.element.dataset["_teller"] = undefined;
    }
    this.element.parentElement.removeChild(this.element);
  }

  registerToElement() {
    if (!this.element.dataset["_teller"]) {
      var i = tellers.indexOf(null);
      if (i !== -1) {
        this.element.dataset["_teller"] = "" + i;
        tellers[i] = this;
      } else {
        this.element.dataset["_teller"] = "" + tellers.length;
        tellers.push(this);
      }
    }
  }

  getTellerFromElement(element:HTMLElement) {
    return tellers[parseInt(element.dataset["_teller"])];
  }

  reevaluate() {
    this.element.innerHTML = this.story.currentElement.innerHTML;
    this.story.evaluate(this.element);
  }

  /*
    _privates
  */
  private _hurryTO:any;

}
export = Teller;
