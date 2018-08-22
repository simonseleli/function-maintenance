import * as _ from 'lodash';
import { FunctionObject } from '../store/models/function.model';

export function getStandardizedFunctions(functionList): FunctionObject[] {
  return _.map(
    functionList || [],
    (functionItem: any, functionIndex: number) => {
      return {
        ...functionItem,
        selected: functionIndex === 0,
        rules: _.map(functionItem.rules || [], (rule: any) => rule.id)
      };
    }
  );
}
