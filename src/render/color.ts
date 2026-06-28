import Phaser from 'phaser';

export function hexColor(color: string): number {
  return Phaser.Display.Color.HexStringToColor(color).color;
}
