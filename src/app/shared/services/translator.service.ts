import { Injectable } from '@angular/core';
import { VerbGroup } from '../models/verbs/verb-group.model';
import { Word } from '../models/words/word.model';
import { ConjugationKey } from '../models/verbs/conjugation-key.model';

@Injectable({
  providedIn: 'root',
})
export class TranslatorService {
  private wordDict = new Map<string, string>();
  private verbDict = new Map<string, string>();

  /**
   * Load words and verbs into internal dictionary
   */
  init(words: Word[], verbGroups: VerbGroup[]) {
    words.forEach((w) => {
      if (w.value && w.translations?.length) {
        this.wordDict.set(w.value.toLowerCase(), w.translations[0]);
      }
    });

    verbGroups.forEach((group) => {
      group.verbs.forEach((verb) => {
        if (verb.infinitive && verb.infinitive_translated?.length) {
          this.verbDict.set(
            verb.infinitive.toLowerCase(),
            verb.infinitive_translated[0]
          );
        }

        if (verb.conjugations) {
          Object.values(verb.conjugations).forEach((tense: ConjugationKey) => {
            Object.values(tense).forEach((form) => {
              const f = form as string;
              this.verbDict.set(
                f.toLowerCase(),
                verb.infinitive_translated?.[0] ?? '-'
              );
            });
          });
        }
      });
    });
  }

  /**
   * Translate a single word
   */
  translateWord(word: string): string {
    const key = word.toLowerCase();
    if (this.wordDict.has(key)) return this.wordDict.get(key)!;
    if (this.verbDict.has(key)) return this.verbDict.get(key)!;
    return word;
  }

  /**
   * Translate a text (split by whitespace and punctuation)
   */
  translateText(text: string): string {
    if (!text) return '';

    return text
      .split(/(\s+|[.,;!?])/)
      .map((token) => this.translateWord(token))
      .join('');
  }
}
