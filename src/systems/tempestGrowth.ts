export type TempestGrowthStage = 'wilderness' | 'camp' | 'village' | 'city';

export type StoryFlags = Readonly<Record<string, boolean | undefined>>;

export function resolveTempestGrowthStage(flags: StoryFlags = {}): TempestGrowthStage {
  if (flags['story.kijin.named'] && flags['faction.dwargon.allied']) return 'city';
  if (flags['story.council.ready']) return 'village';
  if (flags['story.tempest.named']) return 'camp';
  return 'wilderness';
}

export function tempestGrowthLabel(stage: TempestGrowthStage): string {
  switch (stage) {
    case 'camp': return 'Tempest-Lager';
    case 'village': return 'Tempest-Dorf';
    case 'city': return 'Jura-Tempest';
    default: return 'Jura-Wald';
  }
}
