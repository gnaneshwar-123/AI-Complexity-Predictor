export type ComplexityClass =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n^2)'
  | 'O(n^3)'
  | 'O(2^n)'
  | 'O(n!)'
  | 'Inconclusive';

export type ConfidenceCategory = 'High' | 'Medium' | 'Low' | 'Inconclusive';

export interface LoopInfo {
  id: string;
  line_number: number;
  loop_type: 'for' | 'while';
  nesting_level: number;
  parent_loop_id?: string | null;
  bound_type: 'constant' | 'input_dependent' | 'logarithmic' | 'triangular' | 'dynamic' | 'unknown';
  complexity_contribution: string;
  target_var?: string | null;
  bound_expr?: string | null;
  step_description?: string | null;
  is_nested: boolean;
}

export interface RecursionPattern {
  function_name: string;
  line_number: number;
  recursive_calls_count: number;
  reduction_pattern: string;
  recurrence_relation?: string | null;
  estimated_time_complexity: string;
  estimated_space_complexity: string;
  call_sites: number[];
  explanation: string;
}

export interface SpaceAllocationInfo {
  line_number: number;
  allocation_type: string;
  estimated_space: string;
  description: string;
}

export interface ComplexityAnalysisResult {
  time_complexity: string;
  space_complexity: string;
  confidence: ConfidenceCategory;
  confidence_reason: string;
  dominant_term: string;
  detected_loops: LoopInfo[];
  detected_recursion: RecursionPattern[];
  space_allocations: SpaceAllocationInfo[];
  step_by_step_reasoning: string[];
  assumptions: string[];
  limitations: string[];
  optimization_suggestions: string[];
  ast_node_count: number;
  lines_of_code: number;
  cyclomatic_complexity?: number;
  max_nesting_depth?: number;
  functions_analyzed: string[];
  detected_language?: string;
  language_confidence?: number;
  is_valid_syntax: boolean;
  syntax_error_message?: string | null;
  analysis_timestamp: string;
}

export interface ExampleAlgorithm {
  id: string;
  name: string;
  category: string;
  expected_time: string;
  expected_space: string;
  description: string;
  code: string;
}

export interface AlgorithmSnippet {
  id: string;
  name: string;
  code: string;
}

export interface ComparisonItem {
  id: string;
  name: string;
  time_complexity: string;
  space_complexity: string;
  confidence: ConfidenceCategory;
  dominant_term: string;
  loop_count: number;
  recursion_detected: boolean;
  summary: string;
  result: ComplexityAnalysisResult;
}

export interface CompareResponse {
  items: ComparisonItem[];
  comparative_summary: string;
  time_ranking: string[];
  space_ranking: string[];
  timestamp: string;
}

export interface AnalysisHistoryRecord {
  id: string;
  timestamp: string;
  code: string;
  result: ComplexityAnalysisResult;
  snippetTitle?: string;
}
