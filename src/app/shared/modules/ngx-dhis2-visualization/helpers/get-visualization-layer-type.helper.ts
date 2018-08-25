export function getVisualizationLayerType(
  visualizationType: string,
  favorite: any
) {
  return favorite.layer
    ? favorite.layer.indexOf('thematic') !== -1
      ? 'thematic'
      : favorite.layer
    : 'thematic';
}
