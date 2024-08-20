import { ChartConfiguration } from '../models/chart-configuration.model';
export function getChartConfiguration(
  visualizationSettings: any,
  renderId: string,
  visualizationLayout: any,
  customChartType: string = ''
): ChartConfiguration {
  const chartType =
    customChartType !== ''
      ? customChartType.toLowerCase()
      : visualizationSettings.type
      ? visualizationSettings.type.toLowerCase()
      : 'column';
  return {
    renderId: renderId,
    type: chartType,
    title: visualizationSettings.hasOwnProperty('displayName')
      ? visualizationSettings.displayName
      : visualizationSettings.name,
    subtitle: visualizationSettings.hasOwnProperty('subtitle')
      ? visualizationSettings.subtitle
      : '',
    hideTitle: visualizationSettings.hasOwnProperty('hideTitle')
      ? visualizationSettings.hideTitle
      : false,
    hideSubtitle: visualizationSettings.hasOwnProperty('hideSubtitle')
      ? visualizationSettings.hideSubtitle
      : false,
    showData: visualizationSettings.hasOwnProperty('showData')
      ? visualizationSettings.showData
      : true,
    hideEmptyRows: visualizationSettings.hasOwnProperty('hideEmptyRows')
      ? visualizationSettings.hideEmptyRows
      : true,
    hideLegend: visualizationSettings.hasOwnProperty('hideLegend')
      ? visualizationSettings.hideLegend
      : false,
    cumulativeValues: visualizationSettings.hasOwnProperty('cumulativeValues')
      ? visualizationSettings.cumulativeValues
      : false,
    targetLineValue: visualizationSettings.targetLineValue
      ? visualizationSettings.targetLineValue
      : undefined,
    targetLineLabel: visualizationSettings.targetLineLabel
      ? visualizationSettings.targetLineLabel
      : '',
    baseLineValue: visualizationSettings.baseLineValue
      ? visualizationSettings.baseLineValue
      : undefined,
    baseLineLabel: visualizationSettings.baseLineLabel
      ? visualizationSettings.baseLineLabel
      : '',
    legendAlign: 'bottom',
    reverseLegend: false,
    showLabels: true,
    axes: visualizationSettings.axes ? visualizationSettings.axes : [],
    rangeAxisMaxValue: visualizationSettings.rangeAxisMaxValue
      ? visualizationSettings.rangeAxisMaxValue
      : undefined,
    rangeAxisMinValue: visualizationSettings.rangeAxisMinValue
      ? visualizationSettings.rangeAxisMinValue
      : undefined,
    sortOrder: visualizationSettings.hasOwnProperty('sortOrder')
      ? visualizationSettings.sortOrder
      : 0,
    percentStackedValues: visualizationSettings.hasOwnProperty(
      'percentStackedValues'
    )
      ? visualizationSettings.percentStackedValues
      : false,
    multiAxisTypes: visualizationSettings.hasOwnProperty('selectedChartTypes')
      ? visualizationSettings.selectedChartTypes
      : [],
    xAxisType: visualizationLayout.rows ? visualizationLayout.rows : ['dx'],
    yAxisType: visualizationLayout.columns
      ? visualizationLayout.columns[0]
      : 'ou',
    zAxisType: visualizationLayout.filters
      ? visualizationLayout.filters
      : ['pe']
  };
}
