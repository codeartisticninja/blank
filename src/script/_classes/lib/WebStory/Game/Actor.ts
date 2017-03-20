"use strict";
import Game    = require("./Game");
import Vector2 = require("./Vector2");
import Sprite  = require("./Sprite");


/**
 * Actor class
 * 
 * @date 13-02-2017
 */

class Actor {
  game:Game;
  name:string;
  type:string;
  sprite:Sprite;
  frame:number=-1;
  position:Vector2 = new Vector2();
  scale:Vector2 = new Vector2(1);
  offset:Vector2 = new Vector2();
  size:Vector2 = new Vector2(32);

  velocity:Vector2 = new Vector2();
  gravity:Vector2;
  momentum:number=1;
  friction:number=0;

  constructor(obj?:any) {
    if (obj) {
      this.name = obj.name;
      this.type = obj.type;
      this._gid = obj.gid;
      this.position.x = obj.x || 0;
      this.position.y = (obj.y - obj.height) || this.position.x;
      this.size.x = obj.width || 32;
      this.size.y = obj.height || this.size.x;
    }
  }

  get left() {
    return this.position.x + this.offset.x * this.scale.x;
  }
  get top() {
    return this.position.y + this.offset.y * this.scale.y;
  }
  get right() {
    return this.position.x + (this.offset.x + this.size.x) * this.scale.x;
  }
  get bottom() {
    return this.position.y + (this.offset.y + this.size.y) * this.scale.y;
  }

  update() {
    if (!this.momentum) { this.velocity.set(0); return; }
    this.velocity.add(this.gravity || this.game.gravity);
    if (this.friction) {
      let mag = this.velocity.magnitude;
      if (mag > this.friction) {
        this.velocity.magnitude = mag - this.friction;
      } else {
        this.velocity.set(0);
      }
    }
    this.velocity.multiplyXY(this.momentum);
    this.position.add(this.velocity);
  }

  render() {
    if (!this.sprite) {
      this.sprite = this.game.getSpriteByGid(this._gid);
      if (this.frame < 0) {
        this.frame = this._gid - this.sprite.firstGid;
      }
    }
    this.sprite.draw(this.frame, 0, this.offset, this.size);
  }

  overlapsWith(actor:Actor) {
    return this._overlap2D(this.top, this.left, this.bottom, this.right,
      actor.top, actor.left, actor.bottom, actor.right);
  }

  setAnchor(x:number, y=x) {
    this.position.add(this.offset);
    this.offset.set(-x,-y);
    this.position.subtract(this.offset);
  }

  /*
    _privates
  */
  private _gid:number;

  private _overlap1D(a1:number, a2:number, b1:number, b2:number) {
    return Math.max(a1, a2) > Math.min(b1, b2) &&
      Math.min(a1, a2) < Math.max(b1, b2);
  }

  private _overlap2D(ax1:number, ay1:number, ax2:number, ay2:number,
      bx1:number, by1:number, bx2:number, by2:number) {
    return this._overlap1D(ax1, ax2, bx1, bx2) &&
      this._overlap1D(ay1, ay2, by1, by2);
  }

}
export = Actor;
