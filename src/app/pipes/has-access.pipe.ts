import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasAccess',
  pure: false
})
export class HasAccessPipe implements PipeTransform {

  transform(func: any, userGroup,accessess): any {
    var returnVal = false;
    func.userGroupAccesses.forEach((userGroupAccess)=>{
      if(userGroup.id == userGroupAccess.id){
        accessess.forEach((access)=>{
          if(access == userGroupAccess.access){
            returnVal = true;
          }
        })
      }
    })
    return returnVal;
  }

}
