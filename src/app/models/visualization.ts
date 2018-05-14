import {VisualizationLayer} from "./visualization-layer";
export interface Visualization {
  id: string;
  name: string;
  type: string;
  created: string;
  lastUpdated: string;
  shape: string;
  details: any;
  layers: Array<VisualizationLayer>;
  operatingLayers: Array<VisualizationLayer>;
}
