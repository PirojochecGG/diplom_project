export interface StixExternalReference {
  source_name: string;
  external_id?: string;
  url?: string;
}

export interface StixBaseObject {
  type: string;
  id: string;
  spec_version?: string;
  created?: string;
  modified?: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export interface StixReport extends StixBaseObject {
  type: "report";
  published?: string;
  report_types?: string[];
  object_refs?: string[];
}

export interface StixIndicator extends StixBaseObject {
  type: "indicator";
  indicator_types?: string[];
  pattern?: string;
  pattern_type?: string;
  valid_from?: string;
  confidence?: number;
}

export interface StixAttackPattern extends StixBaseObject {
  type: "attack-pattern";
  external_references?: StixExternalReference[];
}

export interface StixRelationship extends StixBaseObject {
  type: "relationship";
  relationship_type?: string;
  source_ref?: string;
  target_ref?: string;
}

export type StixObject =
  | StixReport
  | StixIndicator
  | StixAttackPattern
  | StixRelationship
  | StixBaseObject;

export interface StixBundle {
  type: "bundle";
  id: string;
  spec_version: string;
  objects: StixObject[];
}
