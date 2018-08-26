import * as _ from 'lodash';
import { FunctionRule } from '../store/models/function-rule.model';

export function getStandardizedFunctionRulesFromFunctionList(
  functionList,
  ruleId: string = ''
): FunctionRule[] {
  const functionRules = _.flatten(
    _.map(functionList || [], (functionObject: any) => functionObject.rules)
  );
  const selectedRule = _.find(functionRules, ['id', ruleId]);
  return _.map(functionRules, (functionRule: any) => {
    return {
      ...functionRule,
      selected: selectedRule && selectedRule.id === functionRule.id
    };
  });
}
