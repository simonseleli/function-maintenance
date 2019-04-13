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
  constructor(private store: Store<AppState>) {
    this.currentUser$ = store.select(getCurrentUser);
    this.systemInfo$ = store.select(getSystemInfo);
    this.currentVisualization$ = store.select(getCurrentVisualization);
    this.currentVisualizationDataSelections$ = store.select(
      getCurrentVisualizationDataSelections
    );
    this.loadingFunctions$ = store.select(getFunctionLoadingStatus);
    this.functionsLoaded$ = store.select(getFunctionLoadedStatus);

    this.selectionFilterConfig = {
      showLayout: true
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
    this.store.dispatch(new AddVisualizationItemAction(favorite));
  }

  onCreateFavoriteAction() {}
}
