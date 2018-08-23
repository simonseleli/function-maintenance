import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
declare var ace
window['define'] = ace.define
ace.config.set("basePath", "assets/js/ace");
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

  @Input() code;
  @Input() readonly = false;
  @Input() mode;
  @Output() onCodeUpdate = new EventEmitter();

  editor;

  isCollapsed = {}
  collapsed(event: any): void {
  }

  expanded(event: any): void {
  }
  /*ngOnChanges(changes: SimpleChanges) {

    console.log(changes);
    this.ngOnInit();
    //this.doSomething(changes.categoryId.currentValue);
    // You can also use categoryId.previousValue and
    // categoryId.firstChange for comparing old and new values

  }*/
  modes = {
    "javascript":"ace/mode/javascript",
    "json":"ace/mode/json"
  }
  @Input() snippets;

  id
  ngOnInit() {
    this.selectedTheme = this.themeGroups[0].themes[0];
    setTimeout(()=>{
      this.editor = ace.edit("editor" + this.id);
      this.editor.session.setMode(this.modes[this.mode]);
      this.editor.setReadOnly(this.readonly);
      console.log(typeof this.code);
      if(typeof this.code === "object"){
        this.editor.setValue(JSON.stringify(this.code));
      }else{
        this.editor.setValue(this.code);
      }
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
      editor.getSession().on('change', (e)=> {
        console.log(JSON.stringify(editor.getValue()));
      });
      editor.setValue(snippet.code);
      editor.renderer.setShowGutter(false);
    })
  }
  themeGroups = [
    {name:"Bright",themes:[
      {name:"Chrome",url:"ace/theme/chrome"},
      {name:"Clouds",url:"ace/theme/clouds"},
      {name:"Crimson Editor",url:"ace/theme/crimson_editor"},
      {name:"Dawn",url:"ace/theme/dawn"},
      {name:"Dreamweaver",url:"ace/theme/dreamweaver"},
      {name:"Eclipse",url:"ace/theme/eclipse"},
      {name:"GitHub",url:"ace/theme/github"},
      {name:"IPlastic",url:"ace/theme/iplastic"},
      {name:"Solarized Light",url:"ace/theme/solarized_light"},
      {name:"TextMate",url:"ace/theme/textmate"},
      {name:"Tomorrow",url:"ace/theme/tomorrow"},
      {name:"XCode",url:"ace/theme/xcode"},
      {name:"Kuroir",url:"ace/theme/kuroir"},
      {name:"KatzenMilch",url:"ace/theme/katzenmilch"},
      {name:"SQL Server",url:"ace/theme/sqlserver"}
    ]},
    {name:"Dark",themes:[
      {name:"Ambiance",url:"ace/theme/ambiance"},
      {name:"Chaos",url:"ace/theme/chaos"},
      {name:"Clouds Midnight",url:"ace/theme/clouds_midnight"},
      {name:"Dracula",url:"ace/theme/dracula"},
      {name:"Cobalt",url:"ace/theme/cobalt"},
      {name:"Gruvbox",url:"ace/theme/gruvbox"},
      {name:"Green on Black",url:"ace/theme/gob"},
      {name:"idle Fingers",url:"ace/theme/idle_fingers"},
      {name:"krTheme",url:"ace/theme/kr_theme"},
      {name:"Merbivore",url:"ace/theme/merbivore"},
      {name:"Merbivore Soft",url:"ace/theme/merbivore_soft"},
      {name:"Mono Industrial",url:"ace/theme/mono_industrial"},
      {name:"Monokai",url:"ace/theme/monokai"},
      {name:"Pastel on dark",url:"ace/theme/pastel_on_dark"},
      {name:"Solarized Dark",url:"ace/theme/solarized_dark"},
      {name:"Terminal",url:"ace/theme/terminal"},
      {name:"Tomorrow Night",url:"ace/theme/tomorrow_night"},
      {name:"Tomorrow Night Blue",url:"ace/theme/tomorrow_night_blue"},
      {name:"Tomorrow Night Bright",url:"ace/theme/tomorrow_night_bright"},
      {name:"Tomorrow Night 80s",url:"ace/theme/tomorrow_night_eighties"},
      {name:"Twilight",url:"ace/theme/twilight"},
      {name:"Vibrant Ink",url:"ace/theme/vibrant_ink"}
    ]}
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
