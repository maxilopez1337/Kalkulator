export interface FinancialRow {
  category: string;
  standard: number;
  eliton: number;
  diff: number;
  highlight?: boolean;
  isTotal?: boolean;
}

export interface TimelineStep {
  week: number;
  title: string;
  description: string;
}

export interface RiskItem {
  id: string;
  number: string;
  title: string;
  content: string;
}

export interface ExtraCost {
  label: string;
  value: number;
  type: string;
}

export interface ProposalData {
  id: string;
  clientName: string;
  reportDate: string;
  reportVersion: string;
  savingsYearly: number;
  savingsMonthly: number;
  financialData: FinancialRow[];
  extraCosts: ExtraCost[];
  totalSummary: {
    standard: number;
    eliton: number;
    diff: number;
  };
  riskItems: RiskItem[];
  timelineSteps: TimelineStep[];
}