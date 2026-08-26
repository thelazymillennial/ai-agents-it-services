export type SourceDocument = {
  id: string;
  filename: string;
  kind: "pdf" | "docx" | "txt" | "md" | "csv" | "transcript";
  text: string;
  metadata?: Record<string, string>;
};

export type Evidence = {
  sourceId: string;
  quote?: string;
  locator?: string;
};

export type AgentStatus = "complete" | "needs_input" | "insufficient_evidence";

export type AgentResult<T> = {
  status: AgentStatus;
  output: T | null;
  evidence: Evidence[];
  assumptions: string[];
  missingInformation: string[];
  confidence?: "low" | "medium" | "high";
};
