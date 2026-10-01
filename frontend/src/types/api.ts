export type ModelName = 'pre_pruned_tree' | 'post_pruned_tree' | 'random_forest';

export interface RiceFeatures {
  Area: number;
  Perimeter: number;
  Major_Axis_Length: number;
  Minor_Axis_Length: number;
  Eccentricity: number;
  Convex_Area: number;
  Extent: number;
}

export interface PredictRequest {
  model_name: ModelName;
  features: RiceFeatures;
}

export interface PredictResponse {
  model_name: string;
  model_display_name: string;
  prediction: 'Cammeo' | 'Osmancik' | string;
  probabilities: {
    Cammeo?: number;
    Osmancik?: number;
    [key: string]: number | undefined;
  };
  latency_ms: number;
}

export interface ModelSummary {
  id: string;
  name: string;
  display_name: string;
  trained_at: string;
  hyperparameters: Record<string, any>;
  test_accuracy: number;
  val_accuracy: number;
  train_accuracy: number;
}

export interface ClassMetrics {
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface TestMetrics {
  accuracy: number;
  confusion_matrix: number[][];
  labels: string[];
  per_class: {
    Cammeo: ClassMetrics;
    Osmancik: ClassMetrics;
    macro_avg: ClassMetrics;
    [key: string]: ClassMetrics;
  };
}

export interface SweepPoint {
  max_depth?: number | null;
  alpha?: number;
  n_leaves?: number;
  n_estimators?: number;
  val_accuracy: number;
}

export interface ModelMetricsResponse {
  name: string;
  display_name: string;
  trained_at: string;
  hyperparameters: Record<string, any>;
  metrics: {
    train_accuracy: number;
    val_accuracy: number;
    test: TestMetrics;
    max_depth_sweep?: SweepPoint[];
    alpha_path?: SweepPoint[];
    feature_importance?: Record<string, number>;
  };
}

export interface ModelComparisonItem {
  id: string;
  display_name: string;
  train_accuracy: number;
  val_accuracy: number;
  test_accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  hyperparameters: Record<string, any>;
}

export interface FeatureMetadata {
  name: keyof RiceFeatures;
  vietnamese_name: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  mean: number;
  sample_cammeo: number;
  sample_osmancik: number;
}

export interface DatasetInfoResponse {
  name: string;
  uci_id: number;
  description: string;
  total_samples: number;
  features_count: number;
  classes: string[];
  class_distribution: Record<string, number>;
  features: FeatureMetadata[];
  sample_presets: {
    Cammeo: RiceFeatures;
    Osmancik: RiceFeatures;
    [key: string]: RiceFeatures;
  };
}
