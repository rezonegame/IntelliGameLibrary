
export interface Game {
  id: number;
  name: string;
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
  components: string[];
  rules: string;
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
