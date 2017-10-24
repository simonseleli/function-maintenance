import { Component, OnInit,ViewChild } from '@angular/core';
import {FunctionService} from "../../services/function.service";
import {ContextMenuService} from "ngx-contextmenu/lib/contextMenu.service";
import {ContextMenuComponent} from "ngx-contextmenu/lib/contextMenu.component";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';
import {ToasterService} from 'angular2-toaster';
import {UserService} from "../../services/user.service";
declare var $:any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  sharing;
  details;
  constructor(private functionService:FunctionService,
              private userService:UserService,
              private contextMenuService: ContextMenuService,
              private router:Router, private route:ActivatedRoute,private toasterService: ToasterService) { }

  loading;
  functions;
  userGroups;
  user;
  filterQuery;
  errorResults
  ngOnInit() {
    this.loading = true;
    this.functionService.getAll().subscribe((functions:any)=> {
      this.functions = functions;
      this.userService.getUserGroups().subscribe((userGroups:any)=> {
        this.userGroups = userGroups;
        this.userService.getCurrentUser().subscribe((user:any)=> {
          console.log("User:",user);
          this.user = user;
          this.loading = false;
        },(error)=>{
          this.errorResults = error;
          this.toasterService.pop('error', 'Error', error.message);
          this.loading = false;
        })
      },(error)=>{
        this.errorResults = error;
        this.toasterService.pop('error', 'Error', error.message);
        this.loading = false;
      })
    },(error)=>{
      this.errorResults = error;
      this.toasterService.pop('error', 'Error', error.message);
      this.functions = [];
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
  setUserGroup(func,userGroup,access){
    var found = false;
    var removeIndex = -1;
    func.userGroupAccesses.forEach((userGroupAccess:any,index)=>{
      if(userGroupAccess.id == userGroup.id){
        found = true;
        if(userGroupAccess.access == access){
          removeIndex = index;
        }else{
          userGroupAccess.access = access
        }

      }
    })
    if(removeIndex > -1){
      func.userGroupAccesses.splice(removeIndex,1);
    }
    if(!found){
      func.userGroupAccesses.push({id:userGroup.id,access:access})
    }
    this.functionService.save(func).subscribe((results)=>{
      console.log("Results:",results);
    })
    //console.log()
  }
}
