import * as _ from 'lodash';
import { FunctionRule } from '../store/models/function-rule.model';

export function getStandardizedFunctionRulesFromFunctionList(
  functionList
): FunctionRule[] {
  return _.map(
    _.flatten(
      _.map(functionList || [], (functionObject: any) => functionObject.rules)
    ),
    (functionRule: any, functionRuleIndex: number) => {
      return {
        ...functionRule,
        selected: functionRuleIndex === 0
      };
    }
  );
}
