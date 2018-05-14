import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(values: any, searchText: any): any {
    if(searchText){
      var returnValue = [];
      console.log(values);
      values.forEach((value)=>{
        var field = "name";
        if(value.displayName){
          field = "displayName";
        }
        if(value[field].toLowerCase().indexOf(searchText.toLowerCase()) > -1){
          returnValue.push(value);
        }
      })
      return returnValue;
    }else{
      return values;
    }
  }

}
