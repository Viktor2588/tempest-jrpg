import {
  ELEMENT_FUSIONS,
  type ElementFusionDefinition,
  type ElementType
} from '../data';

const fusionByPair = new Map<string, ElementFusionDefinition>(
  ELEMENT_FUSIONS.map((fusion) => [
    fusionPairKey(fusion.elements[0], fusion.elements[1]),
    fusion
  ])
);

export function resolveElementFusion(
  first: ElementType | null | undefined,
  second: ElementType | null | undefined
): ElementFusionDefinition | null {
  if (!first || !second || first === 'neutral' || second === 'neutral') {
    return null;
  }
  return fusionByPair.get(fusionPairKey(first, second)) ?? null;
}

export function fusionPairKey(first: ElementType, second: ElementType): string {
  return [first, second].sort().join('+');
}
