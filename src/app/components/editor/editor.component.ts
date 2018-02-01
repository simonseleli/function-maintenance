import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
declare var ace
declare var js_beautify

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

  isCollapsed = {}
  collapsed(event: any): void {
    console.log(event);
  }

  expanded(event: any): void {
    console.log(event);
  }
  modes = {
    "javascript":"ace/mode/javascript"
  }
  snippets = [
    {name:"Aggregate Analytics",code:"function analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/25/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&hierarchyMeta=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try{\n                    //Code goes here\n                    resolve(analyticsResults);\n                }catch(e){\n                   reject(error); \n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Organisation Unit",code:"function organisationUnitsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/25/organisationUnits.json\",\n            type: \"GET\",\n            success: function(organisatioUnitsResults) {\n                try {\n                    //Code goes here\n                    resolve(organisatioUnitsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Data Value Sets",code:"function dataValueSetsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/25/dataValueSets.json?dataSet=dataSetID&orgUnit=orgUnitId&period=period\",\n            type: \"GET\",\n            success: function(dataValueSetsResults) {\n                try {\n                    //Code goes here\n                    resolve(dataValueSetsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Analytics Format",code:"{\n    \"headers\": [{\n        \"name\": \"dx\",\n        \"column\": \"Data\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"pe\",\n        \"column\": \"Period\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"ou\",\n        \"column\": \"Organisation unit\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"value\",\n        \"column\": \"Value\",\n        \"valueType\": \"NUMBER\",\n        \"type\": \"java.lang.Double\",\n        \"hidden\": false,\n        \"meta\": false\n    }],\n    \"metaData\": {\n        \"names\": {\n            \"dx\": \"Data\",\n            \"pe\": \"Period\",\n            \"ou\": \"Organisation unit\",\n            \"m0frOspS7JY\": \"MOH - Tanzania\",\n            \"QHq2gYjwLPc\": \"3.2.2-1 Progress Facility profile shared locally\",\n            \"201812\": \"December 2018\",\n            \"uGIJ6IdkP7Q\": \"default\"\n        },\n        \"dx\": [\"QHq2gYjwLPc\"],\n        \"pe\": [\"201812\"],\n        \"ou\": [\"m0frOspS7JY\"],\n        \"co\": [\"uGIJ6IdkP7Q\"]\n    },\n    \"rows\": [],\n    \"width\": 0,\n    \"height\": 0\n}"}
  ]
  ngOnInit() {
    this.editor = ace.edit("editor");
    this.editor.session.setMode(this.modes[this.mode]);
    this.editor.setValue(this.code);
    this.setTheme(this.themeGroups[0].themes[0])
    this.setFontSize(this.fontSize);
    this.editor.getSession().on('change', (e)=> {
      console.log(JSON.stringify(this.editor.getValue()))
      this.onCodeUpdate.emit(this.editor.getValue());
    });
    this.editor.getSession().setUndoManager(new ace.UndoManager())
  }
  shown(snippet,index){
    Object.keys(this.isCollapsed).forEach((key)=>{
      if(key != index){
        this.isCollapsed[key] = false
      }
    })
    setTimeout(()=>{
      let editor = ace.edit("editor" + index);
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
  setCode(code){
    console.log("Selection:",this.editor.getSelectionRange())
    let range = this.editor.getSelectionRange();
    if(range.start.row == range.end.row && range.start.column == range.end.column){
      this.editor.session.insert(this.editor.getCursorPosition() , code);
    }else{
      this.editor.session.replace(range, code);
    }
    //this.editor.session.insert(this.editor.getCursorPosition() , code);
    this.editor.setValue(js_beautify(this.editor.getValue()));
  }
  format(){
    this.editor.setValue(js_beautify(this.editor.getValue()));
  }
}
