export type IocStatus = "candidate" | "confirmed" | "rejected";

export interface AttackTechnique {
  id: number;
  attack_id: string;
  tactic: string;
  technique_name: string;
  reference_url: string;
}

export interface IocAttribute {
  id: number;
  key: string;
  value: string;
}

export interface Ioc {
  id: number;
  incident_id: number;
  type: string;
  value: string;
  normalized_value: string;
  description: string | null;
  confidence: number;
  status: IocStatus;
  extracted_from: string | null;
  created_at: string;
  updated_at: string;
  attributes: IocAttribute[];
  attack_techniques: AttackTechnique[];
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  source: string | null;
  created_at: string;
  updated_at: string;
  iocs: Ioc[];
}

export interface Feed {
  id: number;
  name: string;
  incident_id: number;
  created_at: string;
  stix_bundle_path: string | null;
  stix_exported_at: string | null;
  iocs: Ioc[];
}
