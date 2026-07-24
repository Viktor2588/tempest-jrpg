import { describe, expect, it } from 'vitest';
import {
  resolveTempestGrowthStage,
  tempestGrowthLabel
} from '../src/systems/tempestGrowth';

describe('resolveTempestGrowthStage (Fortschritts-Gate)', () => {
  it('startet ohne Flags in der Wildnis', () => {
    expect(resolveTempestGrowthStage()).toBe('wilderness');
    expect(resolveTempestGrowthStage({})).toBe('wilderness');
  });

  it('steigt entlang der Story-Flags Lager → Dorf → Stadt', () => {
    expect(resolveTempestGrowthStage({ 'story.tempest.named': true })).toBe('camp');
    expect(resolveTempestGrowthStage({ 'story.council.ready': true })).toBe('village');
    expect(
      resolveTempestGrowthStage({ 'story.kijin.named': true, 'faction.dwargon.allied': true })
    ).toBe('city');
  });

  it('verlangt für die Stadt BEIDE Flags (Kijin benannt UND Dwargon verbündet)', () => {
    expect(resolveTempestGrowthStage({ 'story.kijin.named': true })).toBe('wilderness');
    expect(resolveTempestGrowthStage({ 'faction.dwargon.allied': true })).toBe('wilderness');
  });

  it('hält die Rangfolge Stadt > Dorf > Lager ein, wenn mehrere Flags gesetzt sind', () => {
    const all = {
      'story.tempest.named': true,
      'story.council.ready': true,
      'story.kijin.named': true,
      'faction.dwargon.allied': true
    };
    expect(resolveTempestGrowthStage(all)).toBe('city');
    expect(
      resolveTempestGrowthStage({ 'story.tempest.named': true, 'story.council.ready': true })
    ).toBe('village');
  });
});

describe('tempestGrowthLabel', () => {
  it('beschriftet jede Stufe', () => {
    expect(tempestGrowthLabel('wilderness')).toBe('Jura-Wald');
    expect(tempestGrowthLabel('camp')).toBe('Tempest-Lager');
    expect(tempestGrowthLabel('village')).toBe('Tempest-Dorf');
    expect(tempestGrowthLabel('city')).toBe('Jura-Tempest');
  });
});
