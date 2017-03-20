"use strict";
import Actor    = require("../lib/WebStory/Game/Actor");
import Pong     = require("../tellers/Pong");



/**
 * Ball class
 */

class Ball extends Actor {
  game:Pong;

  constructor(obj?:any) {
    super(obj);
    this.setAnchor(8);
  }

  update() {
    if (this.game.joypad.delta.fire === 1 && !this.velocity.magnitude) {
      this.velocity.set(Math.round(Math.random())?8:-8, Math.random()*8-4);
    }
    super.update();
    if (this.position.x < 0) {
      this.game.p2Points++;
      this.position.subtract(this.velocity);
      this.position.subtract(this.velocity);
    }
    if (this.position.x > this.game.canvas.width) {
      this.game.p1Points++;
      this.position.subtract(this.velocity);
      this.position.subtract(this.velocity);
    }
    if (this.position.y < 0) {
      this.velocity.y = Math.abs(this.velocity.y);
    }
    if (this.position.y > this.game.canvas.height) {
      this.velocity.y = -Math.abs(this.velocity.y);
    }
  }

}
export = Ball;
