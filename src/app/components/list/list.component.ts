import { Component, OnInit,ViewChild } from '@angular/core';
import {FunctionService} from "../../services/function.service";
import {ContextMenuService} from "ngx-contextmenu/lib/contextMenu.service";
import {ContextMenuComponent} from "ngx-contextmenu/lib/contextMenu.component";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';
import {ToasterService} from 'angular2-toaster';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  constructor(private functionService:FunctionService,private contextMenuService: ContextMenuService, private router:Router, private route:ActivatedRoute,private toasterService: ToasterService) { }

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

  // Optional
  @ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;

  public onContextMenu($event: MouseEvent, item: any): void {
    this.contextMenuService.show.next({
      // Optional - if unspecified, all context menu components will open
      contextMenu: this.contextMenu,
      event: $event,
      "item": item,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  navigate(functionId){
    this.router.navigate([functionId], {relativeTo: this.route});
  }
  deletingMap = {}
  failedDeletingMap = {}
  delete(func){
    this.failedDeletingMap[func.id] = undefined;
    if(confirm("Are you sure you want to delete the function " + func.name + "?")){
      this.deletingMap[func.id] = true;
      this.functionService.delete(func).subscribe((results)=>{
        this.functions.splice(this.functions.indexOf(func),1);
        this.deletingMap[func.id] = undefined;
        this.toasterService.pop('success', 'Success', 'Function deleted successfully.');
      },(error)=>{
        this.toasterService.pop('error', 'Delete Error', error.message);
        this.deletingMap[func.id] = undefined;
        this.failedDeletingMap[func.id] = true;
      })
    }
  }
}
