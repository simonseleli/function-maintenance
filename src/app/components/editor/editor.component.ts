import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
declare var ace

@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  constructor() { }

  @Input() code
  @Input() mode;
  @Output() onCodeUpdate = new EventEmitter();

  editor

  modes = {
    "javascript":"ace/mode/javascript"
  }
  ngOnInit() {
    this.editor = ace.edit("editor");
    this.editor.session.setMode(this.modes[this.mode]);
    this.editor.setValue(this.code);
    this.setTheme(this.themeGroups[0].themes[0])
    this.setFontSize(this.fontSize);
    this.editor.getSession().on('change', (e)=> {
      this.onCodeUpdate.emit(this.editor.getValue());
    });
    this.editor.getSession().setUndoManager(new ace.UndoManager())
  }

  themeGroups = [
    {name:"Bright",themes:[{name:"Chrome",url:"ace/theme/chrome"}]},
    {name:"Dark",themes:[{name:"Monokai",url:"ace/theme/monokai"}]}
  ]
  selectedTheme
  setTheme(theme){
    this.selectedTheme = theme;
    this.editor.setTheme(theme.url);
    console.log("Theme:",this.editor.getTheme())
  }

  sizes = [
    10,11,12,13,14, 16,20,24
  ]
  fontSize = 14
  setFontSize(fontSize){
    this.fontSize = fontSize;
    this.editor.setFontSize(fontSize + "px");
  }

  copy(){
    document.execCommand('copy');
  }
  cut(){
    document.execCommand('cut');
  }
  paste(){
    document.execCommand('paste');
  }
  undo(){
    this.editor.undo()
  }
  redo(){
    this.editor.redo()
  }
}
