import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
declare var ace
declare var js_beautify

let idNumber = 0;
@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  constructor() {
    idNumber++;
    this.id = idNumber
  }

  @Input() code
  @Input() mode;
  @Output() onCodeUpdate = new EventEmitter();

  editor

  isCollapsed = {}
  collapsed(event: any): void {
  }

  expanded(event: any): void {
  }
  modes = {
    "javascript":"ace/mode/javascript",
    "json":"ace/mode/json"
  }
  @Input() snippets;

  id
  ngOnInit() {
    setTimeout(()=>{
      this.editor = ace.edit("editor" + this.id);
      this.editor.session.setMode(this.modes[this.mode]);
      this.editor.setValue(this.code);
      this.setTheme(this.themeGroups[0].themes[0])
      this.setFontSize(this.fontSize);
      this.editor.getSession().on('change', (e)=> {
        this.onCodeUpdate.emit(this.editor.getValue());
      });
      this.editor.getSession().setUndoManager(new ace.UndoManager())
    })
  }
  shown(snippet,index){
    Object.keys(this.isCollapsed).forEach((key)=>{
      if(key != index){
        this.isCollapsed[key] = false
      }
    })
    setTimeout(()=>{
      let editor = ace.edit("readonly-editor" + index);
      editor.session.setMode(this.modes[this.mode]);
      editor.setValue(snippet.code);
      editor.renderer.setShowGutter(false);
    })
  }
  themeGroups = [
    {name:"Bright",themes:[{name:"Chrome",url:"ace/theme/chrome"}]},
    {name:"Dark",themes:[{name:"Monokai",url:"ace/theme/monokai"}]}
  ]
  selectedTheme
  setTheme(theme){
    this.selectedTheme = theme;
    this.editor.setTheme(theme.url);
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

  fold(){
    this.editor.getSession().foldAll();//.foldAll(1, 28);
  }
  unFold(){
    this.editor.getSession().unfold();//.foldAll(1, 28);
  }
  setCode(code,i){
    let range = this.editor.getSelectionRange();
    if(range.start.row == range.end.row && range.start.column == range.end.column){
      this.editor.session.insert(this.editor.getCursorPosition() , code);
    }else{
      this.editor.session.replace(range, code);
    }
    //this.editor.session.insert(this.editor.getCursorPosition() , code);
    this.editor.setValue(js_beautify(this.editor.getValue()));
    this.isCollapsed[i] = false
  }
  format(){
    this.editor.setValue(js_beautify(this.editor.getValue()));
  }
}
