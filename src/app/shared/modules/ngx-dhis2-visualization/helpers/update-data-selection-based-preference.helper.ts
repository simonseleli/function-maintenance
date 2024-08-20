import * as _ from 'lodash';
import { USER_ORG_UNITS } from '@iapps/ngx-dhis2-org-unit-filter';
import { VisualizationDataSelection } from '../models';

// TODO: Refactor this implementation to be flexible for increased preferences
export function updateDataSelectionBasedOnPreferences(
  dataSelection: VisualizationDataSelection,
  visualizationType,
  favoritePreferences: any
) {
  switch (_.camelCase(visualizationType)) {
    case 'chart': {
      const chartPreferences =
        favoritePreferences[_.camelCase(visualizationType)];

      if (!chartPreferences) {
        return dataSelection;
      }

      let dataSelectionItems = [];
      if (
        chartPreferences.excludeOrgUnitChildren &&
        dataSelection.dimension === 'ou'
      ) {
        if (
          _.some(
            dataSelection.items,
            (item: any) => item.type && item.type.indexOf('LEVEL') !== -1
          )
        ) {
          dataSelectionItems = _.filter(
            dataSelection.items,
            (item: any) => item.type && item.type.indexOf('LEVEL') === -1
          );
        } else if (
          chartPreferences.includeOrgUnitChildren &&
          dataSelection.dimension === 'ou' &&
          _.some(
            dataSelection.items,
            (item: any) => item.id && item.id.indexOf('CHILDREN') !== -1
          )
        ) {
          const userOrgUnit = _.find(USER_ORG_UNITS, ['id', 'USER_ORGUNIT']);
          dataSelectionItems = [
            {
              id: 'USER_ORGUNIT',
              name: userOrgUnit ? userOrgUnit.name : '',
              type: userOrgUnit ? userOrgUnit.type : 'USER_ORGANISATION_UNIT',
            },
          ];
        }
      }
      return {
        ...dataSelection,
        items:
          dataSelectionItems.length > 0
            ? dataSelectionItems
            : dataSelection.items,
      };
    }
    case 'reportTable': {
      const reportTablePreferences =
        favoritePreferences[_.camelCase(visualizationType)];

      if (!reportTablePreferences) {
        return dataSelection;
      }

      let dataSelectionItems = [];
      if (
        reportTablePreferences.excludeOrgUnitChildren &&
        dataSelection.dimension === 'ou'
      ) {
        if (
          !_.some(
            dataSelection.items,
            (item: any) =>
              (item.type && item.type.indexOf('LEVEL') !== -1) ||
              (item.id && item.id.indexOf('CHILDREN') !== -1)
          )
        ) {
          const lowestOrgUnitLevel = _.min(
            _.filter(_.map(dataSelection.items, (item: any) => item.level))
          );

          if (lowestOrgUnitLevel) {
            dataSelectionItems = [
              ...dataSelection.items,
              { id: `LEVEL-${lowestOrgUnitLevel + 1}`, name: 'Level 2' },
            ];
          } else {
            const userOrgUnitChildren = _.find(USER_ORG_UNITS, [
              'id',
              'USER_ORGUNIT_CHILDREN',
            ]);
            dataSelectionItems = [
              {
                id: 'USER_ORGUNIT_CHILDREN',
                name: userOrgUnitChildren ? userOrgUnitChildren.name : '',
                type: userOrgUnitChildren
                  ? userOrgUnitChildren.type
                  : 'USER_ORGANISATION_UNIT',
              },
            ];
          }
        }
      }

      return {
        ...dataSelection,
        items:
          dataSelectionItems.length > 0
            ? dataSelectionItems
            : dataSelection.items,
      };
    }
    default:
      return dataSelection;
  }
}
