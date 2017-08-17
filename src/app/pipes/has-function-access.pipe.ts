import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasFunctionAccess'
})
export class HasFunctionAccessPipe implements PipeTransform {

  transform(functions:any, user):any {
    var returnVal = [];
    functions.forEach((func)=> {
      var hasAccess = func.user.id == user.id;
      if (!hasAccess) {
        func.userGroupAccesses.forEach((userGroupAccess)=> {
          console.log(user);
          user.userGroups.forEach((userGroup)=> {
            if (userGroup.id == userGroupAccess.id) {
              hasAccess = true;
            }
          })
        })
      }
      if (hasAccess) {
        returnVal.push(func);
      }
    })
    return returnVal;
  }


}
