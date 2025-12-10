export interface CertificateData {
  studentName: string;
  degree: string;
  university: string;
  graduationDate: string;
  gpa: string;
  issuanceDate: string;
}

export interface Block {
  index: number;
  timestamp: string;
  data: CertificateData;
  previousHash: string;
  hash: string;
  nonce: number;
  isGenesis?: boolean;
  isTampered?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errorBlockIndex?: number;
  reason?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ISSUER = 'ISSUER',
  AUDITOR = 'AUDITOR'
}