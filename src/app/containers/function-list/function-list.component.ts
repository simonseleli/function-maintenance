import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {ToasterService} from 'angular2-toaster';
import { UserService } from '../../core/services/user.service';
import { FunctionService } from '../../core/services/function.service';
import * as fromModels from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import { Observable } from 'rxjs/index';
import { AppState } from '../../store/reducers/index';
import { Store } from '@ngrx/store';
import {
  getFunctions,
  getSelectedFunctions
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors';

@Component({
  selector: 'app-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.css']
})
export class FunctionListComponent implements OnInit {
  sharing;
  details;
  functionList$: Observable<fromModels.FunctionObject[]>;
  constructor(private functionService:FunctionService,private store: Store<AppState>,
    private userService:UserService,private toasterService: ToasterService) {
    this.functionList$ = store.select(getFunctions);
  }

  loading;
  functions;
  userGroups;
  user;
  filterQuery;
  errorResults;
  deleteItem = -1;


  ngOnInit() {
    this.loading = true;
    this.functionList$.subscribe((functions:any)=> {
      //alert("Function" + JSON.stringify(functions));
      console.log("Functions:",functions);
      this.functions = functions;
      this.userService.getUserGroups().subscribe((userGroups:any)=> {
        this.userGroups = userGroups;
        this.userService.getCurrentUser().subscribe((user:any)=> {
          console.warn("User:",user);
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

  currentYear = (new Date()).getFullYear();

  deletingMap = {};
  deletedMap = {};
  failedDeletingMap = {};
  mf;
  deleting = false;
  delete(func){
    this.failedDeletingMap[func.id] = undefined;
    this.deletingMap[func.id] = true;

    this.functionService.delete(func).subscribe((results)=>{
      this.deleting = true;

      setTimeout(()=>{
        this.functions.splice(this.functions.indexOf(func),1);
        this.deletingMap[func.id] = undefined;
        this.deleteItem = -1;
        this.toasterService.pop('success', 'Success', 'Function deleted successfully.');
        this.deleting = false;
      })
    },(error)=>{
      this.toasterService.pop('error', 'Delete Error', error.message);
      this.deletingMap[func.id] = undefined;
      this.deleteItem = -1;
      this.failedDeletingMap[func.id] = true;
    })
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

  @Output() onFunctionSelected: EventEmitter<any> = new EventEmitter<any>();
  showFunction(func){
    this.onFunctionSelected.emit(func);
  }
}
