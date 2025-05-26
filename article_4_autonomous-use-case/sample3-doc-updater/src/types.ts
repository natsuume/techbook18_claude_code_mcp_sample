export interface ChangeAnalysis {
  apiChanges: ApiChange[];
  configChanges: ConfigChange[];
  featureChanges: FeatureChange[];
  breakingChanges: string[];
}

export interface ApiChange {
  file: string;
  type: 'added' | 'modified' | 'removed';
  description: string;
}

export interface ConfigChange {
  file: string;
  parameter: string;
  oldValue?: string;
  newValue?: string;
}

export interface FeatureChange {
  name: string;
  description: string;
  usage: string;
}