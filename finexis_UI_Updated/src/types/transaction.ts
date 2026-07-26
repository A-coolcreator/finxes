export interface ApiTransaction {
  id: string;
  personId?: string;
  personName?: string;
  date?: string;
  description?: string;
  chqNo?: string;
  amount?: number;
  type?: string;
  balance?: number;
  category?: string;
  flow?: string;
  flagged?: number | boolean;
  metaIfscCode?: string;
}

export type RiskLevel = "Low" | "Medium" | "High";

export interface RuleHit {
  id: string;
  severity?: string;
  details?: string;
  weight?: number;
}

export interface EnrichedTransaction extends ApiTransaction {
  txn_id?: string;
  txn_type?: string;
  channel?: string;
  counterparty_vpa?: string;
  counterparty_name?: string;
  counterparty_ifsc?: string;
  reference_no?: string;
  keyword_tags?: string[];
  digital_category?: string;
  digital_risk_level?: string;
  is_crypto?: boolean;
  crypto_entity?: string | null;
  mule_score?: number;
  mule_rules_hit?: string[];
  rule_hits?: RuleHit[];
  risk_level?: string;
}
