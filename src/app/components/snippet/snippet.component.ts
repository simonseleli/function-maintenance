import { Component, OnInit, Input,ViewChild } from '@angular/core';
import {BsDropdownMenuDirective} from "ngx-bootstrap/dropdown"
declare var ace
declare var $

@Component({
  selector: 'app-snippet',
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.css']
})
export class SnippetComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  @Input() snippet;
  @Input() index;

  @ViewChild('drop') dropdown: BsDropdownMenuDirective;
  shown(snippet,index){
    setTimeout(()=>{
      let editor = ace.edit("editor" + index);
      editor.session.setMode("ace/mode/javascript");
      editor.setValue(snippet.code);
      editor.renderer.setShowGutter(false);
    })
  }
  hide(){

  }
}
