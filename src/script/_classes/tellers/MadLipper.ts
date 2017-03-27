"use strict";
import WebStory = require("../lib/WebStory/WebStory");
import Teller   = require("../lib/WebStory/Teller");


/**
 * MadLipper class
 */

class MadLipper extends Teller {
  static statusBar:HTMLElement;
  src:string;
  output = "";
  inputName:string;
  inputValue = "";
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
    if (this.element.classList.contains("status")) {
      MadLipper.statusBar = this.element;
      this.setStatus("Start typing.");
    }
    if (!this.src.trim()) {
      this.hurry();
    }
  }

  type() {
    var len = this.element.textContent.length;
    if (len < this.output.length) {
      this.setOutput(this.output.substr(0, Math.max(len, this.inputPos)));
      if (this.inputName) {
        this.inputValue = this.output.substr(this.inputPos);
      } else {
        this.inputValue = "";
      }
    } else
    if (len > this.output.length) {
      var char:string,
          chars = this.element.textContent.substr(this.output.length).replace("\u00A0", " ");
      while (chars) {
        char = chars.charAt(0); chars = chars.substr(1);
        if (this.inputName) {
          if (this.output.trim().substr(-1) !== "%") {
            if (char.toLocaleLowerCase() === char.toLocaleUpperCase()) {
              if (this.inputChoices) {
                this.setFirstName();
              }
              this.output += char;
            } else {
              this.inputValue = this.element.textContent.substr(this.inputPos);
              this.output = this.src.substr(0, this.inputPos) + this.inputValue;
            }
            /* if (this.inputValue) {
              char = this.inputValue.substr(-1);
              if (this.inputType === char) {
                this.inputValue = this.inputValue.replace(char, "");
                this.setFirstName();
              } else if (char.toLocaleLowerCase() === char.toLocaleUpperCase() && this.inputType === " ") {
                this.inputValue = this.inputValue.replace(char, "");
                this.setFirstName();
              } else if (".!?".indexOf(char) !== -1 && this.inputType !== "$") {
                this.setFirstName();
              }
            } */
          }
        } else {
          char = this.src.charAt(this.output.length);
          if (char !== "%") {
            this.output = this.src.substr(0, this.output.length+1);
          }
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
    this.setStatus();
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
    // var val = this.story.get(this.inputName);
    var desc = this.story.get(this.inputName+"_");
    if (desc instanceof Array) {
      this.inputChoices = desc;
    } else
    if (name.substr(-2) === "Xe") {
      this.inputChoices = [ "he", "she", "it", "they" ];
    } else
    if (name.substr(-3) === "Xim") {
      this.inputChoices = [ "him", "her", "it", "them" ];
    } else
    if (name.substr(-3) === "Xis") {
      this.inputChoices = [ "his", "her", "its", "their" ];
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
    if (this.inputChoices) {
      val = val.toLocaleLowerCase();
      if (this.inputChoices.indexOf(val) === -1) {
        return this.setOutput(this.output.substr(0, this.src.indexOf("%")));
      }
      if (name.substr(-2) === "Xe" || name.substr(-3) === "Xim" || name.substr(-3) === "Xis") {
        var gender = this.inputChoices.indexOf(val);
        var suf = name.substr(-3); if (suf.charAt(0) !== "X") suf = suf.substr(1);
        this.story.set(this.inputName.replace(suf, "Xe"),  [ "he",  "she", "it", "they" ][gender]);
        this.story.set(this.inputName.replace(suf, "Xim"), [ "him", "her", "it", "them" ][gender]);
        this.story.set(this.inputName.replace(suf, "Xis"), [ "his", "her", "its", "their" ][gender]);
      }
    }
    this.story.set(this.inputName, val);
    this.reevaluate();
    this.src = this.element.textContent; //.replace(name, val);
    this.inputName = null;
    this.inputValue = "";
    this.inputChoices = null;
    this.setOutput(this.src.substr(0, this.inputPos + val.length));
    this.inputPos = this.output.length;
  }

  setOutput(txt=this.output) {
    if (this.element.textContent === txt) {
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

  setStatus(status:string="") {
    if (!status) {
      if (this.inputName) {
        if (this.output.substr(-1) === "%") {
          status = "Press backspace and type in ";
        } else {
          status += "Type in ";
        }
        if (this.inputChoices) {
          status += this.inputChoices.join("/");
        } else
        if (this.story.get(this.inputName + "_")) {
          status += this.story.get(this.inputName + "_");
        } else
        if (this.getSuffix(this.inputName)) {
          status += this.getSuffix(this.inputName).toLocaleLowerCase();
        } else {
          switch (this.inputType) {
            case " ":
              status += "a word";
              break;
            
            case ";":
              status += "a sentence";
              break;
            
            case "$":
              status += "a paragraph";
              break;
            
            default:
              status += "something";
              break;
          }
        }
        if (this.output.substr(-1) !== "%") {
          status += ", then press ";
          switch (this.inputType) {
            /* case " ":
              status += "space.";
              break;
            
            case ";":
              status += "period.";
              break; */
            
            default:
              status += "enter.";
              break;
          }
        } else {
          status += ".";
        }
      } else {
        if (this.src.charAt(this.output.length) === "%") {
          status = "Press enter.";
        } else {
          status = "Type anything (or press enter)."
        }
      }
    }
    if (MadLipper.statusBar) {
      MadLipper.statusBar.textContent = status;
    } else {
      console.log(status);
    }
  }

  getSuffix(name:string) {
    var suf = "";
    while (name) {
      suf = name.substr(-1) + suf;
      name = name.substr(0, name.length-1);
      if (suf.charAt(0) !== suf.charAt(0).toLocaleLowerCase()) {
        return suf;
      }
    }
    return null;
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
