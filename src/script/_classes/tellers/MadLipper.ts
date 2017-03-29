"use strict";
import WebStory = require("../lib/WebStory/WebStory");
import Teller   = require("../lib/WebStory/Teller");


/**
 * MadLipper class
 */

class MadLipper extends Teller {
  static statusBar:HTMLElement;
  static txtInput:HTMLTextAreaElement;
  src:string;
  output = "";
  inputName:string;
  // inputValue = "";
  // inputPos:number=-1;
  // inputType:string;
  inputChoices:string[];

  constructor(story:WebStory, element:HTMLElement) {
    super(story, element);
    this.src = this.element.textContent.trim();
    console.log(this.src);
    this.element.textContent = this.output;
    this.type = this.type.bind(this);
    this._type = this._type.bind(this);
    this.setFirstName = this.setFirstName.bind(this);
    document.addEventListener("keydown", this._type);
    if (!MadLipper.txtInput) {
      MadLipper.txtInput = document.createElement("textarea");
      MadLipper.txtInput.classList.add("madlipper");
      // this.story.appendElement(MadLipper.txtInput);
    }
    MadLipper.txtInput.addEventListener("blur", this.setFirstName);
  }

  init() {
    if (this.src) {
      if (!MadLipper.txtInput.matches(":focus")) {
        this.story.appendElement(MadLipper.txtInput);
        this.appendElement();
      } else {
        this.appendElement();
        this.story.appendElement(MadLipper.txtInput);
      }
    } else {
      this.appendElement();
    }
    // this.element.contentEditable = "true";
    // this.element.focus();
    // MadLipper.txtInput.focus();
    this.setOutput("");
    if (!this.src.trim()) {
      this.hurry();
    }
    if (this.element.classList.contains("status")) {
      MadLipper.statusBar = this.element;
      console.log(MadLipper.statusBar);
      this.setStatus("You can start typing now.");
    }
  }

  type() {
    if (this.inputName) {
      if (MadLipper.txtInput.value.substr(-1) === "\n") {
        this.setFirstName();
      } else {
        this.setOutput();
      }
    } else {
      var p = Math.min(
        (this.src+" ").indexOf(" ", this.output.length)+1,
        (this.src+"%").indexOf("%")
        );
      this.setOutput(this.src.substr(0, p));
      MadLipper.txtInput.value = " ";
      if (this.src.charAt(p) === "%") {
        this.getFirstName();
      }
    }
    this.setStatus();
  }

  getFirstName() {
    var p = this.src.indexOf("%"), name = "", char = "";
    if (p < 0) return "";
    name = this.src.charAt(p++);
    this.inputName = "";
    while (char = this.src.charAt(p++)) {
      if (char.toLocaleLowerCase() !== char.toLocaleUpperCase() || parseInt(char)+1) {
        this.inputName += char;
        name += char;
      } else if (";$".indexOf(char) !== -1) {
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
    MadLipper.txtInput.value = "a ";
    console.log("reading", name);
    return name;
  }

  setFirstName() {
    var val = MadLipper.txtInput.value.replace("a ", "").trim().replace(/\%/g, "");
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
    this.inputChoices = null;
    this.setOutput(this.output + " " + val + " ");
  }

  setOutput(txt=this.output) {
    this.element.textContent = this.output = txt;
    if (this.inputName) {
      this.element.textContent += " " + MadLipper.txtInput.value.replace("a ", "");
    }
    if (this.element.textContent.substr(-1).trim() === "") {
      this.element.innerHTML = this.element.innerHTML.trim() + '&nbsp;';
    }
    if (this.output.length < this.src.length) {
      this.element.innerHTML += '<span class="cursor"/>';
    }
    // window.scrollTo(0,0);
    MadLipper.txtInput.focus();
    // MadLipper.txtInput.scrollIntoView(false);
    // this.element.scrollIntoView();
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
          status += "something";
        }
        if (this.output.substr(-1) !== "%") {
          status += ", then press enter.";
        } else {
          status += ".";
        }
      } else {
        if (this.src.charAt(this.output.length) === "%") {
          status = "Press enter.";
        } else {
          status = "Type anything."
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
      MadLipper.txtInput.removeEventListener("blur", this.setFirstName);
      this.element.contentEditable = "false";
      this.element.textContent = this.output;
      super.hurry();
    }
    MadLipper.txtInput.focus();
  }

  /*
    _private
  */

  private _type(e:KeyboardEvent) {
    if (e.keyCode === 9) {
      e.preventDefault();
      this.setFirstName();
    }
    requestAnimationFrame(this.type);
  }
}
export = MadLipper;
