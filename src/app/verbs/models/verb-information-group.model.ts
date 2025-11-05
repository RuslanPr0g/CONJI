import { VerbInformationSubgroup } from './verb-information-subgroup.model';

export interface VerbInformationGroup {
  group: number;
  description: string;
  subgroups: VerbInformationSubgroup[];
}
