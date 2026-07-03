
export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'funding' | 'completed';
  goal: string;
}

export interface ImpactProject {
  id: string;
  projectCode: string;
  name: string;
  category: 'Environment' | 'Education' | 'Health' | 'Infrastructure';
  costPerOutcome: number;
  unitName: string;
  efficiencyRating: number;
  description: string;
  totalOutcomes: number;
  fundingTarget: string;
  campaigns?: Campaign[];
  currentRisk?: number;
}

export interface PortfolioItem {
  project: ImpactProject;
  unitsContributed: number;
  totalDonated: number;
}
