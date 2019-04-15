import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import {
  FunctionObject,
  FunctionRule
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/models';
import {
  AddFunctionRule,
  SetActiveFunctionRule,
  UpdateFunctionRule
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function-rule.actions';
import {
  AddFunction,
  SetActiveFunction,
  UpdateFunction,
  DeleteFunction,
  SaveFunction
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import {
  getActiveFunctionRule,
  getFunctionRulesForActiveFunction
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function-rule.selectors';
import {
  getActiveFunction,
  getFunctions
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function.selectors';
import { AppState, Go } from 'src/app/store';
import { SimulateVisualizationAction } from 'src/app/store/actions/current-visualization.actions';

import { VisualizationDataSelection } from '../../shared/modules/ngx-dhis2-visualization/models';
import { User } from 'src/app/core';
import {
  getCurrentUser,
  getCurrentVisualizationDataSelections,
  getSelectedFunctionParameters
} from 'src/app/store/selectors';
import { FunctionService } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/services';
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-function-management',
  templateUrl: './function-management.component.html',
  styleUrls: ['./function-management.component.css']
})
export class FunctionManagementComponent implements OnInit {
  functionList$: Observable<FunctionObject[]>;
  functionRules$: Observable<FunctionRule[]>;
  activeEditor: string;
  activeFunction$: Observable<FunctionObject>;
  activeFunctionRule$: Observable<FunctionRule>;
  currentUser$: Observable<User>;
  selectedFunctionParameters$: Observable<any>;

  constructor(
    private readonly store: Store<AppState>,
    private readonly functionService: FunctionService,
    private readonly toasterService: ToasterService
  ) {
    this.activeEditor = 'FUNCTION';
  }

  ngOnInit() {
    this.activeFunction$ = this.store.select(getActiveFunction);
    this.activeFunctionRule$ = this.store.select(getActiveFunctionRule);
    this.currentUser$ = this.store.select(getCurrentUser);
    this.functionList$ = this.store.select(getFunctions(true, 'rules'));
    this.functionRules$ = this.store.select(getFunctionRulesForActiveFunction);
    this.selectedFunctionParameters$ = this.store.select(
      getSelectedFunctionParameters
    );
  }

  onNewFunctionObject(functionObject: FunctionObject) {
    this.activeEditor = 'FUNCTION';
    this.store.dispatch(
      new AddFunction({
        function: functionObject
      })
    );
    this.store.dispatch(
      new AddFunctionRule({
        functionRule: functionObject.rules[0]
      })
    );
    this.onActivateFunctionObject(functionObject);
  }

  onNewFunctionRule(functionRuleDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }) {
    this.activeEditor = 'RULE';

    if (
      functionRuleDetails &&
      functionRuleDetails.functionObject &&
      functionRuleDetails.functionRule
    ) {
      this.store.dispatch(
        new AddFunctionRule({
          functionRule: functionRuleDetails.functionRule
        })
      );
      this.onActivateFunctionObject(
        functionRuleDetails.functionObject,
        functionRuleDetails.functionRule.id
      );
    }
  }

  onActivateFunctionObject(
    functionObject: FunctionObject,
    functionRuleId?: string,
    activeEditor?: string
  ) {
    this.activeEditor = activeEditor || 'FUNCTION';
    this.store.dispatch(new SetActiveFunction(functionObject));
    if (functionObject.rules && functionObject.rules[0]) {
      this.store.dispatch(
        new SetActiveFunctionRule(
          functionRuleId || functionObject.rules[0],
          functionObject
        )
      );

      this.store.dispatch(
        new Go({
          path: ['/'],
          query: {
            function: functionObject.id,
            rule: functionRuleId || functionObject.rules[0]
          }
        })
      );
    }
  }

  onActivateFunctionRule(functionRuleDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }) {
    if (
      functionRuleDetails &&
      functionRuleDetails.functionObject &&
      functionRuleDetails.functionRule
    ) {
      this.onActivateFunctionObject(
        functionRuleDetails.functionObject,
        functionRuleDetails.functionRule.id,
        'RULE'
      );
    }
  }

  onSetActiveEditor(e, editor: string) {
    e.stopPropagation();
    this.activeEditor = editor;
  }

  onSimulateFunction(functionObject: FunctionObject) {
    this.activeFunctionRule$
      .pipe(take(1))
      .subscribe((activeFunctionRule: FunctionRule) => {
        this.onSimulate({
          functionObject,
          functionRule: activeFunctionRule,
          item: 'FUNCTION'
        });
      });
  }

  onSimulateFunctionRule(functionRuleDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }) {
    this.onSimulate({
      ...functionRuleDetails,
      item: 'FUNCTION_RULE'
    });
  }

  onSimulate(functionDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
    item: string;
  }) {
    this.store.dispatch(
      new UpdateFunction(functionDetails.functionObject.id, {
        simulating: true,
        selected: true
      })
    );

    this.store.dispatch(
      new UpdateFunctionRule(functionDetails.functionRule.id, {
        selected: true
      })
    );

    this.store.dispatch(
      new SimulateVisualizationAction(
        functionDetails.functionObject,
        functionDetails.functionRule,
        true
      )
    );
  }

  onSaveFunction(functionObject: FunctionObject) {
    this.currentUser$.pipe(take(1)).subscribe((currentUser: User) => {
      this.store.dispatch(new SaveFunction(functionObject, currentUser));
    });
  }

  onSaveFunctionRule(functionRuleDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }) {
    if (
      functionRuleDetails &&
      functionRuleDetails.functionRule &&
      functionRuleDetails.functionObject
    ) {
      // Update rule in the store
      this.store.dispatch(
        new UpdateFunctionRule(
          functionRuleDetails.functionRule.id,
          functionRuleDetails.functionRule
        )
      );

      // save the function
      this.onSaveFunction(functionRuleDetails.functionObject);
    }
  }

  /*
  ? What is the purpose of this function
  TODO: This will have to be removed and find better way to handle this
  */
  upsert(arr, key, newval) {
    const match = _.find(arr, key);
    if (match) {
      const index = _.indexOf(arr, _.find(arr, key));
      arr.splice(index, 1, newval);
    } else {
      arr.push(newval);
    }
  }

  onSave(functionDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
    item: string;
  }) {
    console.log(functionDetails);
    // if (functionDetails.item === 'FUNCTION' && functionDetails.functionObject) {
    //   this.store.dispatch(
    //     new UpdateFunction(functionDetails.functionObject.id, {
    //       ...functionDetails.functionObject,
    //       saving: true,
    //       rules: _.map(
    //         functionDetails.functionObject.rules,
    //         (rule: any) => rule.id
    //       )
    //     })
    //   );
    // } else if (
    //   functionDetails.item === 'FUNCTION_RULE' &&
    //   functionDetails.functionRule
    // ) {
    //   this.store.dispatch(
    //     new UpdateFunctionRule(functionDetails.functionRule.id, {
    //       ...functionDetails.functionRule,
    //       saving: true
    //     })
    //   );
    // }

    // if (
    //   functionDetails.functionObject.name &&
    //   functionDetails.functionObject.name !== ''
    // ) {
    //   this.upsert(
    //     functionDetails.functionObject.rules,
    //     'id',
    //     _.omit(functionDetails.functionRule, [
    //       'saving',
    //       'unsaved',
    //       'simulating',
    //       'selected',
    //       'active'
    //     ])
    //   );
    //   this.currentUser$
    //     .pipe(
    //       take(1),
    //       switchMap((currentUser: any) =>
    //         this.functionService.save(
    //           _.omit(functionDetails.functionObject, [
    //             'saving',
    //             'unsaved',
    //             'simulating',
    //             'selected',
    //             'active'
    //           ]),
    //           currentUser
    //         )
    //       )
    //     )
    //     .subscribe(
    //       results => {
    //         this.onSimulate({
    //           ...functionDetails,
    //           functionObject: {
    //             ...functionDetails.functionObject,
    //             saving: false,
    //             isNew: false,
    //             unsaved: false
    //           },
    //           functionRule: { ...functionDetails.functionRule, saving: false }
    //         });
    //         this.toasterService.pop(
    //           'success',
    //           'Success',
    //           'Function saved successfully.'
    //         );
    //       },
    //       error => {
    //         this.toasterService.pop('error', 'Saving Error', error.message);
    //       }
    //     );
    // } else {
    //   this.toasterService.pop(
    //     'error',
    //     'Saving Error',
    //     'Please write name of function'
    //   );
    // }
  }

  onDeleteFunction(functionObject: FunctionObject) {
    functionObject.deleting = true;
    this.functionService.delete(functionObject).subscribe(
      (results: any) => {
        functionObject.deleting = false;
        this.store.dispatch(
          new DeleteFunction({
            id: functionObject.id
          })
        );
      },
      error => {
        functionObject.deleting = false;
        this.toasterService.pop('error', 'Error', error.message);
      }
    );
  }
}
