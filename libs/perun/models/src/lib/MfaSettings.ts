export interface MfaSettings {
  allEnforced: boolean;
  categories: object;
  includedCategories: string[];
  excludedRps: string[];
  rpsByCategory: Map<string, object>;
  includedRpsByCategory: Map<string, string[]>;
}
