import type { TempestGrowthStage } from '../systems/tempestGrowth';

export interface TempestFacilityDistrict {
  readonly x: number;
  readonly y: number;
  readonly accent: number;
  readonly icon: string;
}

// Freie Randbereiche der offenen Tempest-Karte: die Distrikte sind Kulisse und
// bleiben absichtlich begehbar, damit sie keine vorhandenen Story-Routen blockieren.
export const TEMPEST_FACILITY_DISTRICTS: Readonly<Record<string, TempestFacilityDistrict>> = {
  forge: { x: 19, y: 4, accent: 0xe58a4a, icon: '⚒' },
  kitchen: { x: 5, y: 4, accent: 0x8fd878, icon: '♨' },
  'training-hall': { x: 5, y: 12, accent: 0x78b8e8, icon: '✦' },
  watch: { x: 19, y: 12, accent: 0xe7cb6e, icon: '◆' }
};

export interface TempestFacilityDistrictScale {
  readonly level: 0 | 1 | 2 | 3;
  readonly width: number;
  readonly height: number;
  readonly roofHeight: number;
}

export function tempestFacilityDistrictScale(stage: TempestGrowthStage): TempestFacilityDistrictScale {
  switch (stage) {
    case 'camp':
      return { level: 1, width: 30, height: 18, roofHeight: 14 };
    case 'village':
      return { level: 2, width: 40, height: 25, roofHeight: 18 };
    case 'city':
      return { level: 3, width: 50, height: 32, roofHeight: 22 };
    default:
      return { level: 0, width: 0, height: 0, roofHeight: 0 };
  }
}
