import { Injectable } from '@angular/core';
import {HttpClientService} from "./http-client.service";
import {Observable} from 'rxjs/Rx';

@Injectable()
export class UserService {

  constructor(private http:HttpClientService) { }

  userGroups
  getUserGroups(){
    return new Observable((observable)=>{
      if(this.userGroups){
        observable.next(this.userGroups);
        observable.complete();
      }else{
        this.http.get("userGroups").subscribe((results)=>{
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
        this.http.get("25/me").subscribe((results)=>{
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
