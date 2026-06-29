import { describe, expect, it } from 'vitest';
import { getBattleTutorial } from '../src/systems/battleTutorial';

describe('adaptive Kampftutorials', () => {
  it('zeigt Direwolf-, Hain- und Echo-Hinweise nur beim passenden Encounter', () => {
    expect(getBattleTutorial('direwolf-pack-leader', {})?.title).toContain('Rudeldruck');
    expect(getBattleTutorial('whispering-grove-ambush', {})?.title).toContain('Sporen');
    expect(getBattleTutorial('shrine-approach', {})?.title).toContain('Namenloses Echo');
    expect(getBattleTutorial('east-grass', {})).toBeNull();
  });

  it('blendet einen bereits gesehenen Hinweis aus', () => {
    const tutorial = getBattleTutorial('shrine-approach', {})!;
    expect(getBattleTutorial('shrine-approach', { [tutorial.flag]: true })).toBeNull();
  });
});
