import { SKILLS_DICTIONARY } from '../lib/constants';
import type { SkillMatch } from '../types';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9.#+]/g, ' ');
}

export function extractSkillsFromJD(jdText: string): string[] {
  const normalized = normalize(jdText);
  return SKILLS_DICTIONARY.filter((skill) => {
    const skillNorm = normalize(skill);
    // Use word boundary matching
    const pattern = new RegExp(`(^|\\s|,|\\.|;|:)${skillNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\s|,|\\.|;|:|/)`, 'i');
    return pattern.test(normalized);
  });
}

export function matchSkills(
  requiredSkills: string[],
  userSkills: string[]
): { matches: SkillMatch[]; score: number } {
  const userNorm = userSkills.map((s) => normalize(s));

  const matches: SkillMatch[] = requiredSkills.map((skill) => {
    const sNorm = normalize(skill);
    const exact = userNorm.some((u) => u === sNorm);
    const partial = !exact && userNorm.some((u) => u.includes(sNorm) || sNorm.includes(u));
    return { skill, matched: exact, partial };
  });

  const fullMatches = matches.filter((m) => m.matched).length;
  const partialMatches = matches.filter((m) => m.partial).length;
  const total = matches.length || 1;
  const score = Math.round(((fullMatches + partialMatches * 0.5) / total) * 100);

  return { matches, score };
}

export function categorizeMatches(matches: SkillMatch[]) {
  return {
    strong: matches.filter((m) => m.matched),
    partial: matches.filter((m) => m.partial),
    missing: matches.filter((m) => !m.matched && !m.partial),
  };
}
