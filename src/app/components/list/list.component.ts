import { Component, OnInit } from '@angular/core';
import {FunctionService} from "../../services/function.service";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  constructor(private functionService:FunctionService) { }

  loading;
  functions;
  ngOnInit() {
    this.loading = true;
    this.functionService.getAll().subscribe((functions:any)=> {
      console.log(functions);
      this.functions = functions;
      this.loading = false;
    })
  }


}
