import { Conjugations } from './conjugations.model';

export interface Verb {
  infinitive: string;
  ignoreInGames?: 'conjugation'[];
  infinitive_translated?: string[];
  conjugations: Conjugations;
  type?: 'regular' | 'irregular';
  group: number;
  subgroup: number;
}
