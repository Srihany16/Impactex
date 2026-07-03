
import { ImpactProject } from './types';

export const IMPACT_PROJECTS: ImpactProject[] = [
  {
    id: '1',
    projectCode: 'FOREST',
    name: 'Amazon Reforestation',
    category: 'Environment',
    costPerOutcome: 12.50,
    unitName: 'Trees Planted',
    efficiencyRating: 98,
    description: 'Direct capital for indigenous-led planting programs in the Amazon basin. We utilize satellite verification to ensure every seedling thrives.',
    totalOutcomes: 1245000,
    fundingTarget: '$15.5M',
    campaigns: [
      { id: 'c1', name: 'Xingu Basin Re-wilding', status: 'active', goal: '500k Trees' },
      { id: 'c2', name: 'Satellite Monitoring Phase II', status: 'funding', goal: '$200k' }
    ]
  },
  {
    id: '2',
    projectCode: 'READ',
    name: 'Rural Literacy Initiative',
    category: 'Education',
    costPerOutcome: 45.00,
    unitName: 'Months of Schooling',
    efficiencyRating: 92,
    description: 'Providing digital learning kits and trained educators to remote villages. Focused on long-term systemic improvement of rural educational infrastructure.',
    totalOutcomes: 89000,
    fundingTarget: '$4.0M',
    campaigns: [
      { id: 'c3', name: 'Mobile Library Units', status: 'active', goal: '20 Villages' },
      { id: 'c4', name: 'E-Reader Distribution Drive', status: 'completed', goal: '5k Units' }
    ]
  },
  {
    id: '3',
    projectCode: 'CLEAN',
    name: 'Ocean Plastic Recovery',
    category: 'Environment',
    costPerOutcome: 2.20,
    unitName: 'KG of Plastic Removed',
    efficiencyRating: 95,
    description: 'Autonomous barrier systems capturing ocean-bound plastic in major rivers. We turn waste into verified impact units through circular economy loops.',
    totalOutcomes: 3400000,
    fundingTarget: '$7.4M',
    campaigns: [
      { id: 'c5', name: 'Great Pacific Patch Recovery', status: 'active', goal: '100 Tons' },
      { id: 'c6', name: 'River Trash Fence #4', status: 'funding', goal: '$45k' }
    ]
  },
  {
    id: '4',
    projectCode: 'WATER',
    name: 'Clean Water Access',
    category: 'Infrastructure',
    costPerOutcome: 150.00,
    unitName: 'People Served Yearly',
    efficiencyRating: 89,
    description: 'Borehole construction and solar-powered filtration in drought-prone areas. Every well is fitted with IoT sensors for real-time flow monitoring.',
    totalOutcomes: 12000,
    fundingTarget: '$1.8M',
    campaigns: [
      { id: 'c7', name: 'Solar Desalination Pilot', status: 'active', goal: '1k People' },
      { id: 'c8', name: 'Maintenance Tech Training', status: 'funding', goal: '$12k' }
    ]
  }
];
