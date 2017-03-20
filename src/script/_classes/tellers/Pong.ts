"use strict";
import WebStory = require("../lib/WebStory/WebStory");
import Game     = require("../lib/WebStory/Game/Game");
import Paddle   = require("../actors/Paddle");
import Ball     = require("../actors/Ball");
import Digit    = require("../actors/Digit");


/**
 * Pong class
 */

class Pong extends Game {
  p1Points=0;
  p2Points=0;

  constructor(story:WebStory, element:HTMLElement) {
    super(story, element);
    this.p1Points = this.story.get("player1");
    this.p2Points = this.story.get("player2");
  }

  init() {
    this.actorTypes["paddle"] = Paddle;
    this.actorTypes["ball"]   = Ball;
    this.actorTypes["digit"]  = Digit;
    super.init();
    this.joypad.mode = "gc";
    this.joypad.enable();
  }
  start() {
    super.start();
    this.frameRate = 15;
  }
  stop() {
    this.story.set("player1", this.p1Points);
    this.story.set("player2", this.p2Points);
    super.stop();
  }

  update() {
    super.update();
    this.onOverlap(this.actorsByType["ball"], this.actorsByType["paddle"], this.ballMeetsPaddle);
  }

  ballMeetsPaddle(ball:Ball, paddle:Paddle) {
    ball.velocity.multiplyXY(-1,1);
    ball.velocity.add(paddle.velocity);
    var el = document.createElement("p");
    el.textContent = "Pong!";
    this.story.appendElement(el);
    // this.setSticky(true);
  }

}
export = Pong;
