"use strict";
import Teller = require("./Teller");
import WebStory = require("./WebStory");


/**
 * Chapter class
 * 
 * @date 09-02-2017
 */

class Chapter extends Teller {

  constructor(story:WebStory, element:HTMLElement) {
    super(story, element);
  }

  init() {
    var chapter = <HTMLElement>this.story.newSection("article");
    chapter.setAttribute("class", this.element.getAttribute("class"));
    if (this.story.impatience) this.goOn();
  }

  goOn() {
    this.hurry();
  }
}
export = Chapter;
