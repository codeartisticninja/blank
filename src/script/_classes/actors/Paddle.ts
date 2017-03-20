"use strict";
import Actor    = require("../lib/WebStory/Game/Actor");
import Pong     = require("../tellers/Pong");



/**
 * Paddle class
 */

class Paddle extends Actor {
  game:Pong;

  constructor(obj?:any) {
    super(obj);
    // this.friction = .5;
    this.setAnchor(8, 32);
  }

  update() {
    if (this.name.substr(-1) === "1") {
      this.velocity.y = this.game.joypad.dir.y * 16;
    } else {
      var ball = this.game.actorsByType["ball"][0];
      if (ball.velocity.x > 0) {
        if (ball.position.y < this.position.y) {
          this.velocity.y = Math.min(0, this.velocity.y-1);
        } else {
          this.velocity.y = Math.max(0, this.velocity.y+1);
        }
      } else {
        this.velocity.y = 0;
      }
    }
    super.update();
  }

}
export = Paddle;
