import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { SelectionFilterConfig } from '../../shared/modules/ngx-dhis2-data-selection-filter/models/selected-filter-config.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { Observable } from 'rxjs';
import { User, SystemInfo } from '../../core';
import {
  getCurrentUser,
  getSystemInfo,
  getCurrentVisualization,
  getCurrentVisualizationDataSelections
} from '../../store/selectors';
import { CurrentVisualizationState } from '../../store/reducers/current-visualization.reducer';
import { VisualizationDataSelection } from '../../shared/modules/ngx-dhis2-visualization/models';
import { take } from 'rxjs/operators';
import {
  UpdateCurrentVisualizationWithDataSelectionsAction,
  SimulateVisualizationAction
} from '../../store/actions/current-visualization.actions';
import {
  getAllFunctionRules,
  getFunctionRuleEntities
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/reducers/function-rule.reducer';

import * as fromModels from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import {
  getFunctions,
  getSelectedFunctions,
  getActiveFunctionId,
  getFunctionRulesForActiveFunction,
  getFunctionLoadingStatus,
  getFunctionLoadedStatus
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors';
import {
  UpdateFunctionRule,
  SetActiveFunctionRule
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function-rule.actions';
import {
  UpdateFunction,
  SetActiveFunction
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import {
  FunctionObject,
  FunctionRule
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

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
  functionList$: Observable<fromModels.FunctionObject[]>;
  functionRules$: Observable<fromModels.FunctionRule[]>;
  loadingFunctions$: Observable<boolean>;
  functionsLoaded$: Observable<boolean>;
  constructor(private store: Store<AppState>) {
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

  ngOnInit() {}

  onFilterUpdateAction(dataSelections: VisualizationDataSelection[]) {
    this.store.dispatch(
      new UpdateCurrentVisualizationWithDataSelectionsAction(dataSelections)
    );

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

  onAddFavoriteAction(favoriteDetails: any) {}

  onCreateFavoriteAction() {}

  onActivateFunctionObject(functionObject: FunctionObject) {
    this.store.dispatch(new SetActiveFunction(functionObject));
    if (functionObject.rules && functionObject.rules[0]) {
      this.store.dispatch(
        new SetActiveFunctionRule(functionObject.rules[0], functionObject)
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
    if (functionDetails.item === 'FUNCTION') {
      this.store.dispatch(
        new UpdateFunction(functionDetails.functionObject.id, {
          ...functionDetails.functionObject
        })
      );
    } else {
      this.store.dispatch(
        new UpdateFunctionRule(functionDetails.functionObject.id, {
          ...functionDetails.functionRule
        })
      );
    }

    this.store.dispatch(
      new SimulateVisualizationAction(
        functionDetails.functionObject,
        functionDetails.functionRule,
        true
      )
    );
  }
}
