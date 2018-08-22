export interface FunctionObject {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  active?: boolean;
  function: string;
  rules: any[];
}
