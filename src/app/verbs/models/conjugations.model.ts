import { ConjugationSet } from './conjugation-set.model';
import { ImperativConjugation } from './imperative-conjugation.model';

export interface Conjugations {
  prezent: ConjugationSet;
  perfect_compus: ConjugationSet;
  viitor_literar: ConjugationSet;
  viitor_familiar: ConjugationSet;
  conjunctiv: ConjugationSet;
  conditional: ConjugationSet;
  imperativ: ImperativConjugation;
}
