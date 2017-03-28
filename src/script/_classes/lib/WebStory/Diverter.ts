"use strict";
import Teller = require("./Teller");
import WebStory = require("./WebStory");


/**
 * Diverter class
 * 
 * @date 28-mar-2017
 */

class Diverter extends Teller {

  constructor(story:WebStory, element:HTMLElement) {
    super(story, element);
  }

  init() {
    var dest = this.element.textContent.trim() || "+";
    if (dest === "^") {
      this.story.return(this);
    } else
    if (dest.substr(-2) === " ^") {
      dest = dest.substr(0, dest.length-1).trim();
      this.story.goSub(dest, this);
    } else {
      this.story.goTo(dest, this);
    }
  }
}
export = Diverter;
