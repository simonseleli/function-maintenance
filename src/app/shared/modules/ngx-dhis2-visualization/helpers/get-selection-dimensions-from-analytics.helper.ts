import { VisualizationDataSelection } from '../models';
import * as _ from 'lodash';

export function getSelectionDimensionsFromAnalytics(
  analytics: any
): VisualizationDataSelection[] {
  if (!analytics) {
    return [];
  }

  const analyticsMetadataKeys = _.keys(
    _.omit(analytics.metaData || {}, ['names', 'items'])
  );

  return _.filter(
    _.map(analyticsMetadataKeys, metadataKey => {
      return {
        dimension: metadataKey,
        items: _.map(analytics.metaData[metadataKey], metadataItemId => {
          return {
            id: metadataItemId,
            name: analytics.metaData.names
              ? analytics.metaData.names[metadataItemId]
              : ''
          };
        })
      };
    }),
    selectionDimension => selectionDimension.items.length > 0
  );
}
