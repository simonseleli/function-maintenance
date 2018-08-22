function standardizeIncomingAnalytics(analyticsObject, preferNormalStructure) {
  // if Serverside Event clustering do nothing
  if (analyticsObject.count) {
    return analyticsObject;
  }
  const sanitizedAnalyticsObject = {
    headers: [],
    metaData: {
      names: null,
      dimensions: null
    },
    rows: []
  };

  if (analyticsObject) {
    /**
     * Check headers
     */
    if (analyticsObject.headers) {
      analyticsObject.headers.forEach(function(header){
        try {
          const newHeader = header;
          sanitizedAnalyticsObject.headers.push(newHeader);
        } catch (e) {
          console.warn('Invalid header object');
        }
      });
    }

    /**
     * Check metaData
     */
    if (analyticsObject.metaData) {
      try {
        const sanitizedMetadata = getSanitizedAnalyticsMetadata(analyticsObject.metaData, preferNormalStructure);
        sanitizedAnalyticsObject.metaData = sanitizedMetadata;
      } catch (e) {
        console.log(e);
        console.warn('Invalid metadata object');
      }
    }

    /**
     * Check rows
     */
    if (analyticsObject.rows) {
      sanitizedAnalyticsObject.rows = analyticsObject.rows;
    }
  }

  return sanitizedAnalyticsObject;
}

function getSanitizedAnalyticsMetadata(analyticMetadata, preferNormalStructure) {
  var sanitizedMetadata = {};

  if (analyticMetadata) {
    /**
     * Get metadata names
     */
    if (analyticMetadata.names) {
      sanitizedMetadata.names = analyticMetadata.names;
    } else if (analyticMetadata.items) {
      const metadataItemsKeys = Object.keys(analyticMetadata.items);
      const metadataNames = {};
      if (metadataItemsKeys) {
        metadataItemsKeys.forEach(function(metadataItemKey){
          metadataNames[metadataItemKey] = analyticMetadata.items[metadataItemKey].name;
        });
      }
      sanitizedMetadata['names'] = metadataNames;
    }

    /**
     * Get metadata dimensions
     */
    if (analyticMetadata.dimensions) {
      if (!preferNormalStructure) {
        sanitizedMetadata['dimensions'] = analyticMetadata.dimensions;
      } else {
        sanitizedMetadata = {
          ...sanitizedMetadata,
      ...analyticMetadata.dimensions
      };
      }
    } else {
      const metadataKeys = Object.keys(analyticMetadata);
      const metadataDimensions = {};
      if (metadataKeys) {
        metadataKeys.forEach(function(metadataKey){
          if (metadataKey !== 'names') {
            metadataDimensions[metadataKey] = analyticMetadata[metadataKey];
          }
        });
      }
      if (!preferNormalStructure) {
        sanitizedMetadata['dimensions'] = metadataDimensions;
      } else {
        sanitizedMetadata = {
          ...sanitizedMetadata,
      ...metadataDimensions
      };
      }
    }
  }

  return sanitizedMetadata;
}
