"use strict";
import WebStory = require("../lib/WebStory/WebStory");
import Teller   = require("../lib/WebStory/Teller");


/**
 * MadLipper class
 */

class MadLipper extends Teller {
  src:string;
  output = "";
  inputName:string;
  inputValue:string="_";
  inputPos:number=-1;
  inputType:string;
  inputChoices:string[];

  constructor(story:WebStory, element:HTMLElement) {
    super(story, element);
    this.src = this.element.textContent.trim();
    console.log(this.src);
    this.element.textContent = this.output;
    this.type = this.type.bind(this);
    this._type = this._type.bind(this);
    document.addEventListener("keydown", this._type);
  }

  init() {
    this.appendElement();
    this.element.contentEditable = "true";
    this.element.focus();
    this.setOutput("");
  }

  type() {
    var len = this.element.textContent.length;
    if (len < this.output.length) {
      this.setOutput(this.output.substr(0, Math.max(len, this.inputPos)));
    } else
    if (len > this.output.length) {
      var char:string,
          chars = this.element.textContent.substr(this.output.length).replace("\u00A0", " ");
      while (chars) {
        char = chars[0]; chars = chars.substr(1);
        console.log(JSON.stringify(char), char.charCodeAt(0));
        if (this.inputName) {
          var help = "Type in ";
          if (this.story.get(this.inputName + "_")) {
            help += this.story.get(this.inputName + "_");
          } else {
            switch (this.inputType) {
              case " ":
                help += "a word";
                break;
              
              case ";":
                help += "a sentence";
                break;
              
              case "$":
                help += "a paragraph";
                break;
              
              default:
                help += "something";
                break;
            }
          }
          help += ", then ";
          switch (this.inputType) {
            case " ":
              help += "press space.";
              break;
            
            case ";":
              help += "press period.";
              break;
            
            default:
              help += "press enter.";
              break;
          }
          console.log(help);
          if (this.output.trim().substr(-1) !== "_") {
            this.output += char;
            this.inputValue = this.output.substr(this.inputPos);
            if (this.inputValue) {
              char = this.inputValue.substr(-1);
              if (this.inputType === char) {
                this.inputValue.replace(char, "");
                this.setFirstName();
              } else if (".!?".indexOf(char) !== -1 && this.inputType !== "$") {
                this.setFirstName();
              }
            }
          } else {
            console.log("Press backspace to continue!");
          }
        } else {
          char = this.src.charAt(this.output.length);
          if (char === "%") {
            this.getFirstName();
            char = "_";
            console.log("Press backspace to continue...");
          }
          this.output += char;
        }
      }
      this.setOutput();
    } else if (this.element.innerHTML.trim().substr(-1) === ">") {
      console.log("Enter!");
      if (this.inputName) {
        this.setFirstName();
      } else {
        this.setOutput(this.src.substr(0, (this.src+"%").indexOf("%")));
        this.getFirstName();
      }
    } else {
      this.element.focus();
    }
  }

  getFirstName() {
    var p = this.src.indexOf("%"), name = "", char = "";
    if (p < 0) return "";
    this.inputPos = p;
    name = this.src.charAt(p++);
    this.inputName = "";
    this.inputType = " ";
    while (char = this.src.charAt(p++)) {
      if (char.toLocaleLowerCase() !== char.toLocaleUpperCase()) {
        this.inputName += char;
        name += char;
      } else if (";$".indexOf(char) !== -1) {
        this.inputType = char;
        name += char;
      } else {
        p = this.src.length;
      }
    }
    var val = this.story.get(this.inputName);
    if (val && val.charAt(0) !== "%") {
      console.log("already there!");
      this.src = this.src.replace(name, val);
      this.inputName = null;
      this.inputValue = "_";
    }
    return name;
  }

  setFirstName() {
    var val = this.inputValue.trim().replace(/\%/g, "");
    if (!val) {
      this.output = this.output.trim();
      return;
    }
    var name = this.getFirstName();
    this.story.set(this.inputName, val);
    this.src = this.src.replace(name, val);
    this.inputName = null;
    this.inputValue = "_";
    this.setOutput(this.src.substr(0, this.output.length));
  }

  setOutput(txt=this.output) {
    if (this.element.textContent === txt) {
      console.log("as is");
      this.output = txt;
      return;
    }
    this.element.textContent = this.output = txt;
    var d = this.output.length - this.element.textContent.trim().length;
    while (d > 0) {
      this.element.innerHTML = this.element.innerHTML.trim() + "&nbsp;";
      d--;
    }
    var range = document.createRange();
    range.setStart(this.element.firstChild, this.element.textContent.length);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    this.story.startScrolling();
  }

  hurry() {
    if (this.output.trim() === this.src.trim()) {
      document.removeEventListener("keydown", this._type);
      this.element.contentEditable = "false";
      this.element.textContent = this.output;
      super.hurry();
    }
  }

  /*
    _private
  */

  private _type(e:KeyboardEvent) {
    requestAnimationFrame(this.type);
  }
}
export = MadLipper;
