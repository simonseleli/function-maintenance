import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToasterService } from 'angular2-toaster';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import {
  FunctionObject,
  FunctionRule
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/models';

import { generateUid, SystemInfo, User } from '../../core';
import { SelectionFilterConfig } from '../../shared/modules/ngx-dhis2-data-selection-filter/models/selected-filter-config.model';
import { FunctionService } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/services/function.service';
import {
  AddFunctionRule,
  SetActiveFunctionRule,
  UpdateFunctionRule
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function-rule.actions';
import {
  AddFunction,
  DeleteFunction,
  SetActiveFunction,
  UpdateFunction
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';

import { VisualizationDataSelection } from '../../shared/modules/ngx-dhis2-visualization/models';
import { AppState, Go } from '../../store';
import {
  AddVisualizationItemAction,
  SimulateVisualizationAction,
  UpdateCurrentVisualizationWithDataSelectionsAction
} from '../../store/actions/current-visualization.actions';
import { CurrentVisualizationState } from '../../store/reducers/current-visualization.reducer';
import {
  getCurrentUser,
  getCurrentVisualization,
  getCurrentVisualizationDataSelections,
  getSystemInfo
} from '../../store/selectors';
import {
  getFunctions,
  getFunctionLoadingStatus,
  getFunctionLoadedStatus,
  getSelectedFunctions
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function.selectors';
import { getFunctionRulesForActiveFunction } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function-rule.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selectionFilterConfig: SelectionFilterConfig;
  currentUser$: Observable<User>;
  systemInfo$: Observable<SystemInfo>;
  currentVisualization$: Observable<CurrentVisualizationState>;
  currentVisualizationDataSelections$: Observable<VisualizationDataSelection[]>;
  functionList$: Observable<FunctionObject[]>;
  functionRules$: Observable<FunctionRule[]>;
  loadingFunctions$: Observable<boolean>;
  functionsLoaded$: Observable<boolean>;
  constructor(
    private store: Store<AppState>,
    private functionService: FunctionService,
    private toasterService: ToasterService
  ) {
    this.currentUser$ = store.select(getCurrentUser);
    this.systemInfo$ = store.select(getSystemInfo);
    this.currentVisualization$ = store.select(getCurrentVisualization);
    this.currentVisualizationDataSelections$ = store.select(
      getCurrentVisualizationDataSelections
    );

    this.functionList$ = store.select(getFunctions);
    this.functionRules$ = store.select(getFunctionRulesForActiveFunction);
    this.loadingFunctions$ = store.select(getFunctionLoadingStatus);
    this.functionsLoaded$ = store.select(getFunctionLoadedStatus);

    this.selectionFilterConfig = {
      showLayout: false
    };
  }

  selectedFunction;
  ngOnInit() {}

  onFilterUpdateAction(dataSelections: VisualizationDataSelection[]) {
    this.store.dispatch(
      new UpdateCurrentVisualizationWithDataSelectionsAction(dataSelections)
    );

    this.unSelectFunctionAndRules();

    // TODO move this logic to function effects
    const dxObject = _.find(dataSelections, ['dimension', 'dx']);
    const functionRuleList = _.filter(
      dxObject ? dxObject.items : [],
      item => item.type === 'FUNCTION_RULE'
    );
    _.each(functionRuleList, (functionRule: any) => {
      this.store.dispatch(
        new UpdateFunctionRule(functionRule.id, { selected: true })
      );

      if (functionRule.functionObject) {
        this.store.dispatch(
          new UpdateFunction(functionRule.functionObject.id, { selected: true })
        );
      }
    });
  }

  unSelectFunctionAndRules() {
    this.store
      .select(getSelectedFunctions)
      .pipe(take(1))
      .subscribe((selectedFunctions: any[]) => {
        _.each(selectedFunctions, (selectedFunction: any) => {
          this.store.dispatch(
            new UpdateFunction(selectedFunction.id, { selected: false })
          );
          _.each(selectedFunction.rules, (selectedRule: any) => {
            this.store.dispatch(
              new UpdateFunctionRule(selectedRule.id, { selected: false })
            );
          });
        });
      });
  }

  onAddFavoriteAction(favorite: any) {
    this.unSelectFunctionAndRules();
    const dashboardItem = {
      id: generateUid(),
      type: favorite.dashboardTypeDetails.type,
      [_.camelCase(favorite.dashboardTypeDetails.type)]: favorite
        .dashboardTypeDetails.isArray
        ? [
            {
              id: favorite.id,
              name: favorite.name
            }
          ]
        : {
            id: favorite.id,
            name: favorite.name
          }
    };

    this.store.dispatch(new AddVisualizationItemAction(dashboardItem));
  }

  onCreateFavoriteAction() {}

  onNewFunctionObject(functionObject: FunctionObject) {
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

  onNewFunctionRule(functionRule: FunctionRule) {
    this.store.dispatch(
      new AddFunctionRule({
        functionRule: functionRule
      })
    );
    this.onActivateFunctionObject(functionRule);
  }

  onActivateFunctionObject(functionObject: FunctionObject) {
    this.store.dispatch(new SetActiveFunction(functionObject));
    if (functionObject.rules && functionObject.rules[0]) {
      this.store.dispatch(
        new SetActiveFunctionRule(functionObject.rules[0], functionObject)
      );

      this.store.dispatch(
        new Go({
          path: ['/'],
          query: {
            function: functionObject.id,
            rule: functionObject.rules[0].id
          }
        })
      );
    }
  }

  onActivateFunctionRule(functionDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }) {
    this.store.dispatch(
      new SetActiveFunctionRule(
        functionDetails.functionRule,
        functionDetails.functionObject
      )
    );
  }

  onSimulate(functionDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
    item: string;
  }) {
    this.store.dispatch(
      new UpdateFunction(functionDetails.functionObject.id, {
        ...functionDetails.functionObject,
        simulating: true,
        selected: true,
        rules: _.map(
          functionDetails.functionObject.rules,
          (rule: any) => rule.id
        )
      })
    );

    this.store.dispatch(
      new UpdateFunctionRule(functionDetails.functionRule.id, {
        ...functionDetails.functionRule,
        simulating: true,
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

  onSave(functionDetails: {
    functionRule: FunctionRule;
    functionObject: FunctionObject;
    item: string;
  }) {
    if (functionDetails.item === 'FUNCTION' && functionDetails.functionObject) {
      console.log(functionDetails.functionObject);
      this.store.dispatch(
        new UpdateFunction(functionDetails.functionObject.id, {
          ...functionDetails.functionObject,
          saving: true,
          rules: _.map(
            functionDetails.functionObject.rules,
            (rule: any) => rule.id
          )
        })
      );
    } else if (
      functionDetails.item === 'FUNCTION_RULE' &&
      functionDetails.functionRule
    ) {
      this.store.dispatch(
        new UpdateFunctionRule(functionDetails.functionRule.id, {
          ...functionDetails.functionRule,
          saving: true
        })
      );
    }

    if (
      functionDetails.functionObject.name &&
      functionDetails.functionObject.name !== ''
    ) {
      this.upsert(
        functionDetails.functionObject.rules,
        'id',
        _.omit(functionDetails.functionRule, [
          'saving',
          'unsaved',
          'simulating',
          'selected',
          'active'
        ])
      );
      this.currentUser$
        .pipe(
          take(1),
          switchMap((currentUser: any) =>
            this.functionService.save(
              _.omit(functionDetails.functionObject, [
                'saving',
                'unsaved',
                'simulating',
                'selected',
                'active'
              ]),
              currentUser
            )
          )
        )
        .subscribe(
          results => {
            this.onSimulate({
              ...functionDetails,
              functionObject: {
                ...functionDetails.functionObject,
                saving: false,
                isNew: false,
                unsaved: false
              },
              functionRule: { ...functionDetails.functionRule, saving: false }
            });
            this.toasterService.pop(
              'success',
              'Success',
              'Function saved successfully.'
            );
          },
          error => {
            this.toasterService.pop('error', 'Saving Error', error.message);
          }
        );
    } else {
      this.toasterService.pop(
        'error',
        'Saving Error',
        'Please write name of function'
      );
    }
  }
  upsert(arr, key, newval) {
    const match = _.find(arr, key);
    if (match) {
      const index = _.indexOf(arr, _.find(arr, key));
      arr.splice(index, 1, newval);
    } else {
      arr.push(newval);
    }
  }
  onDelete(functionDetails) {
    functionDetails.functionObject.deleting = true;
    this.functionService.delete(functionDetails.functionObject).subscribe(
      (results: any) => {
        functionDetails.functionObject.deleting = false;
        this.store.dispatch(
          new DeleteFunction({
            id: functionDetails.functionObject.id
          })
        );
      },
      error => {
        functionDetails.functionObject.deleting = false;
        this.toasterService.pop('error', 'Error', error.message);
      }
    );
  }
}
