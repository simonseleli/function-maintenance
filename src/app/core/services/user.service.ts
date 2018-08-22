import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models';
import { NgxDhis2HttpClientService } from '@hisptz/ngx-dhis2-http-client';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  /**
   * Load current user information
   * @returns {Observable<User>}
   */
  loadCurrentUser(): Observable<User> {
    return this.httpClient
      .get(`me.json?fields=id,name,displayName,created,lastUpdated,email,
    dataViewOrganisationUnits[id,name,level],organisationUnits[id,name,level],userCredentials[username]`);
  }

  userGroups
  getUserGroups(){
    return new Observable((observable)=>{
      if(this.userGroups){
        observable.next(this.userGroups);
        observable.complete();
      }else{
        this.httpClient.get("userGroups").subscribe((results:any)=>{
          this.userGroups = results.userGroups;
          observable.next(this.userGroups);
          observable.complete();
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      }
    })
  }
  user
  getCurrentUser(){
    return new Observable((observable)=>{
      if(this.user){
        observable.next(this.user);
        observable.complete();
      }else{
        this.loadCurrentUser().subscribe((results)=>{
          this.user = results;
          observable.next(this.user);
          observable.complete();
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      }
    })
  }
}
