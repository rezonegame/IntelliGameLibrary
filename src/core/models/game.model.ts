export interface GameRules {
  objective: string;
  setup: string;
  gameplay: string;
}

export interface ModificationSuggestion {
  themeSwaps: string[];
  mechanicFusions: string[];
}

export interface Game {
  id: number;
  name: string;
  originalName?: string;
  image: string;
  description: string;
  players: {
    min: number;
    max: number;
  };
  playTime: {
    min: number;
    max: number;
  };
  complexity: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  category: string;
  mechanics: string[];
  componentsDescription: string;
  historicalStory?: string;
  modificationSuggestion?: ModificationSuggestion;
  rules: GameRules;
  aiAnalysis: AiAnalysis;
  variants: string[];
}

export interface AiAnalysis {
  coreFun: string;
  keyDecisions: string;
  potentialFlaws: string;
  designImpact: string;
}

export type FilterCategory = 'players' | 'playTime' | 'complexity' | 'category';
