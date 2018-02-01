import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataFilter'
})
export class DataFilterPipe implements PipeTransform {

  transform(array: any[], query: string,dataIndex): any {
    if (query) {
      return array.filter(row=> {
        return row[dataIndex].toLowerCase().indexOf(query.toLowerCase()) > -1
      });
    }
    return array;
  }

}
