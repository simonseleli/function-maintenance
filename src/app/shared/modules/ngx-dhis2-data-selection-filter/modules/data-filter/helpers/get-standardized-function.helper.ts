import * as _ from 'lodash';
import { FunctionObject } from '../store/models/function.model';

export function getStandardizedFunctions(
  functionList,
  functionId: string = ''
): FunctionObject[] {
  const selectedFunction = _.find(functionList || [], ['id', functionId]);
  return _.map(functionList || [], (functionItem: any) => {
    return {
      ...functionItem,
      selected: selectedFunction && selectedFunction.id === functionItem.id,
      rules: _.map(functionItem.rules || [], (rule: any) => rule.id)
    };
  });
}
