"use strict";
import Actor    = require("../lib/WebStory/Game/Actor");
import Pong     = require("../tellers/Pong");



/**
 * Digit class
 */

class Digit extends Actor {
  game:Pong;
  running:boolean;

  constructor(obj?:any) {
    super(obj);
    this.setAnchor(13, 23);
  }

  update() {
    if (this.name.substr(-1) === "1") {
      if (this.frame !== this.game.p1Points) {
        this.frame = this.game.p1Points;
        this.game.story.set("winner", 1);
        this.running = this.running == null ? true : false;
      }
    } else {
      if (this.frame !== this.game.p2Points) {
        this.frame = this.game.p2Points;
        this.game.story.set("winner", 2);
        this.running = this.running == null ? true : false;
      }
    }
  }

  render() {
    super.render();
    if (!this.running) this.game.stop();
  }

}
export = Digit;
