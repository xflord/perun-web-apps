export interface MfaSettings {
  categories: object;
  includedCategories: string[];
  excludedRps: string[];
  rpsByCategory: Map<string, object>;
  includedRpsByCategory: Map<string, string[]>;
}
