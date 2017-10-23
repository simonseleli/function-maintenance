import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultRule'
})
export class DefaultRulePipe implements PipeTransform {

  transform(func: any, args?: any): any {
    let returnRule:any = {};
    func.rules.forEach((rule)=>{
      if(rule.isDefault){
        returnRule = rule;
      }
    })
    if(returnRule.isDefault){
      return returnRule;
    }else{
      if(func.rules.length == 0){
        return {}
      }else{
        return func.rules[0];
      }
    }
  }

}
