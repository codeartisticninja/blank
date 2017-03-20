/// <reference path="../../../../_d.ts/node.d.ts"/>
"use strict";
import Teller   = require("../Teller");
import WebStory = require("../WebStory");
import Actor    = require("./Actor");
import Sprite   = require("./Sprite");
import Vector2  = require("./Vector2");
import joypad   = require("./webJoypad");
import http     = require("http");


/**
 * Game class
 * 
 * @date 22-02-2017
 */

class Game extends Teller {
  running:boolean = true;
  canvas:HTMLCanvasElement;
  ctx:CanvasRenderingContext2D;
  frameInterval:number=1000/30;
  nextFrameTime:number=0;
  actorTypes:Object = {};
  actors:Actor[]=[];
  // actorsByLayer:Object = {};
  actorsByType:Object = {};
  spritesByFirstGid:Sprite[]=[];
  spritesByName:Object = {};
  gravity:Vector2 = new Vector2();
  joypad = joypad;
  mapData:any;
  mapUrl:string;

  constructor(story:WebStory, element:HTMLElement) {
    super(story, element);
    this.canvas = <HTMLCanvasElement>this.element;
    this.ctx = this.canvas.getContext("2d");
    this.element = document.createElement("p");
    this.element.setAttribute("class", this.canvas.getAttribute("class"));
    this.element.classList.add("game");
    var div = document.createElement("div");
    // div.classList.add("page-width");
    this.element.appendChild(div);
    div.appendChild(this.canvas);
    this._tick = this._tick.bind(this);
    this._onRelease = this._onRelease.bind(this);
    document.body.addEventListener("keyup", this._onRelease);
    document.body.addEventListener("touchend", this._onRelease);
    this.mapUrl = this.story.get("_map");
  }

  get frameRate() {
    return 1000/this.frameInterval;
  }
  set frameRate(val:number) {
    this.frameInterval = 1000/val;
  }

  init() {
    var _t = this;
    this.registerToElement();
    if (this.mapUrl) {
      http.get(this.mapUrl, function(res){
        var data = "";
        res.on("data", function(chunk:string){ data += chunk; });
        res.on("end", function() {
          _t.mapData = JSON.parse(data.trim());
          _t.loadMap();
        });
      });
    } else {
      this.appendElement();
    }
  }

  loadMap() {
    var mapFolder = this.mapUrl.substr(0, this.mapUrl.lastIndexOf("/")+1);
    for (var tileset of this.mapData.tilesets) {
      this.addSprite(new Sprite(tileset, mapFolder));
    }
    for (var layer of this.mapData.layers) {
      switch (layer.type) {
        case "objectgroup":
          for (var obj of layer.objects) {
            if (this.actorTypes[obj.type]) {
              this.addActor(new this.actorTypes[obj.type](obj));
            } else {
              this.addActor(new Actor(obj));
            }
          }
          break;
      }
    }
    this.appendElement();
    this.start();
  }

  start() {
    this.running = true;
    requestAnimationFrame(this._tick);
  }
  stop() {
    this.running = false;
    this.setSticky(false);
    this.hurry();
  }
  hurry() {
    if (!this.running) {
      cancelAnimationFrame(this._tickTO);
      if (this.joypad.dir.magnitude || this.joypad.fire) {
        this.joypad.update();
        this._tickTO = requestAnimationFrame(this.hurry);
        return;
      }
      this.joypad.disable();
      document.body.removeEventListener("keyup", this._onRelease);
      document.body.removeEventListener("touchend", this._onRelease);
      this.story.impatience = 0;
      this.story.newSection();
      super.hurry();
    }
  }

  update() {
    this.joypad.update();
    for (var actor of this.actors) {
      actor.update();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var actor of this.actors) {
      this.ctx.save();
      this.ctx.translate(actor.position.x, actor.position.y);
      this.ctx.scale(actor.scale.x, actor.scale.y);
      actor.render();
      this.ctx.restore();
    }
    if (!this.element.classList.contains("sticky") && this.element.getBoundingClientRect().top < 32) {
      this.setSticky(true);
    }
  }

  addActor(actor:Actor, ...toGroup:Array<Actor>[]) {
    toGroup.push(this.actors);
    toGroup.push(this.actorsByType[actor.type] = this.actorsByType[actor.type] || []);
    for (var group of toGroup) {
      var i = group.indexOf(actor);
      if (i === -1) {
        group.push(actor);
      }
    }
    actor.game = this;
    return actor;
  }

  removeActor(actor:Actor, ...fromGroup:Array<Actor>[]) {
    setTimeout(()=>{
      fromGroup.push(this.actors);
      fromGroup.push(this.actorsByType[actor.type]);
      for (var group of fromGroup) {
        var i = group.indexOf(actor);
        if (i !== -1) {
          group.splice(i,1);
        }
      }
    });
    return actor;
  }

  addSprite(sprite:Sprite) {
    this.spritesByFirstGid[sprite.firstGid] = sprite;
    this.spritesByName[sprite.name] = sprite;
    sprite.game = this;
  }
  getSpriteByGid(gid:number) {
    while (gid > -1 && !this.spritesByFirstGid[gid]) {
      gid--;
    }
    return this.spritesByFirstGid[gid];
  }
  getSpriteByName(name:string) {
    return this.spritesByName[name];
  }

  onOverlap(a:Actor|Array<Actor>, b:Actor|Array<Actor>, resolver:Function, context:Object=this) {
    if (a instanceof Actor) a = [ a ];
    if (b instanceof Actor) b = [ b ];
    for (var actorA of a) {
      for (var actorB of b) {
        if (actorA !== actorB && actorA.overlapsWith(actorB)) {
          resolver.call(context, actorA, actorB);
        }
      }
    }
  }

  setSticky(sticky:boolean) {
    var div = this.element.querySelector("div");
    if (sticky && !this.element.classList.contains("sticky")) {
      div.style.top = this.element.getBoundingClientRect().top + "px";
      this.element.classList.add("sticky");
      setTimeout(()=>{
        div.removeAttribute("style");
      }, 50);
    } else if (!sticky && this.element.classList.contains("sticky")) {
      div.style.top = "-15em";
      setTimeout(()=>{
        this.element.classList.remove("sticky");
        div.removeAttribute("style");
      }, 4096);
    }
  }

  /*
    _privates
  */
  private _tickTO:any;

  private _tick(t:number=0) {
    cancelAnimationFrame(this._tickTO);
    var updates = 0;
    if (this.nextFrameTime < t-50) this.nextFrameTime = t;
    while(this.nextFrameTime <= t) {
      this.update();
      this.nextFrameTime += this.frameInterval;
      updates++;
    }
    if (updates) this.render();
    if (this.running) this._tickTO = requestAnimationFrame(this._tick);
  }

  private _onRelease() {
    setTimeout(()=>{
      this.story.startScrolling();
    }, 1024);
  }

}
export = Game;
