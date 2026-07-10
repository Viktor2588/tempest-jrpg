import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { PLACEHOLDER_KINDS, VFX_KINDS } from '../render/artSpec';
import { generatePlaceholderTextures, placeholderKey } from '../render/placeholderArt';
import { generatePortraitTextures, portraitKey } from '../render/portraitAtlas';
import { generateVfxTextures, vfxKey } from '../render/vfxAtlas';
import { generatePrologueBattleBackgrounds } from '../render/battleBackgroundAtlas';
import {
  BOG_TERROR_TEXTURE_KEY,
  DIREWOLF_ALPHA_TEXTURE_KEY,
  DIREWOLF_PUP_TEXTURE_KEY,
  FOREST_SLIME_TEXTURE_KEY,
  GABIRU_TEXTURE_KEY,
  IFRIT_TEXTURE_KEY,
  ACADEMY_WISP_TEXTURE_KEY,
  BLUMUND_BANDIT_TEXTURE_KEY,
  KINGDOM_UNIT_ATLAS,
  KINGDOM_UNIT_FRAMES,
  KINGDOM_UNIT_TEXTURE_KEY,
  LIZARDMAN_ACOLYTE_TEXTURE_KEY,
  LIZARDMAN_WARRIOR_TEXTURE_KEY,
  MASKED_MAJIN_TEXTURE_KEY,
  MAGIC_COLOSSUS_TEXTURE_KEY,
  NAMELESS_ECHO_TEXTURE_KEY,
  OGRE_WARRIOR_TEXTURE_KEY,
  ORC_DISASTER_TEXTURE_KEY,
  ORC_GENERAL_TEXTURE_KEY,
  ORC_SCOUT_TEXTURE_KEY,
  ORC_SOLDIER_TEXTURE_KEY,
  SPORE_MOTH_TEXTURE_KEY
} from '../render/enemyArt';
import { OVERWORLD_RIMURU_TEXTURE_KEY } from '../render/overworldArt';
import { BATTLE_ARENA_TEXTURES, PARTY_BATTLE_ART } from '../render/battleArt';
import { REGION_BANNER_TEXTURES, TEMPEST_GROWTH_BANNER_TEXTURES } from '../render/regionBannerArt';
import { configureHiDpiScene } from '../render/hiDpi';
import { KENNEY_PIXEL_TEXTURE_KEYS } from '../render/textureSharpness';
// Echte CC0-Kacheln (Kenney „Tiny Town", CC0 — siehe ASSETS.md). Vite liefert die
// korrekte (gehashte, base-bewusste) URL; Phaser lädt sie als Textur.
import grassUrl from '../assets/tiles/grass.png';
import wallUrl from '../assets/tiles/wall.png';
import pathUrl from '../assets/tiles/path.png';
import marshFloorTileUrl from '../assets/tiles/tile-marsh-floor.webp';
import marshWallTileUrl from '../assets/tiles/tile-marsh-wall.webp';
import highlandsFloorTileUrl from '../assets/tiles/tile-highlands-floor.webp';
import highlandsWallTileUrl from '../assets/tiles/tile-highlands-wall.webp';
import blumundFloorTileUrl from '../assets/tiles/tile-blumund-floor.webp';
import blumundWallTileUrl from '../assets/tiles/tile-blumund-wall.webp';
import dwargonFloorTileUrl from '../assets/tiles/tile-dwargon-floor.webp';
import dwargonWallTileUrl from '../assets/tiles/tile-dwargon-wall.webp';
import juraBattlefieldFloorTileUrl from '../assets/tiles/tile-jura-battlefield-floor.webp';
import juraBattlefieldWallTileUrl from '../assets/tiles/tile-jura-battlefield-wall.webp';
import lizardmanMarshFloorTileUrl from '../assets/tiles/tile-lizardman-marsh-floor.webp';
import lizardmanMarshWallTileUrl from '../assets/tiles/tile-lizardman-marsh-wall.webp';
import emberHollowFloorTileUrl from '../assets/tiles/tile-ember-hollow-floor.webp';
import emberHollowWallTileUrl from '../assets/tiles/tile-ember-hollow-wall.webp';
import tempestCampFloorTileUrl from '../assets/tiles/tile-tempest-camp-floor.webp';
import tempestVillageFloorTileUrl from '../assets/tiles/tile-tempest-village-floor.webp';
import tempestCityFloorTileUrl from '../assets/tiles/tile-tempest-city-floor.webp';
import {
  DWARGON_FLOOR_TILE_TEXTURE_KEY,
  DWARGON_WALL_TILE_TEXTURE_KEY,
  EMBER_HOLLOW_FLOOR_TILE_TEXTURE_KEY,
  EMBER_HOLLOW_WALL_TILE_TEXTURE_KEY,
  HIGHLANDS_FLOOR_TILE_TEXTURE_KEY,
  HIGHLANDS_WALL_TILE_TEXTURE_KEY,
  BLUMUND_FLOOR_TILE_TEXTURE_KEY,
  BLUMUND_WALL_TILE_TEXTURE_KEY,
  JURA_BATTLEFIELD_FLOOR_TILE_TEXTURE_KEY,
  JURA_BATTLEFIELD_WALL_TILE_TEXTURE_KEY,
  LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
  LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY,
  MARSH_FLOOR_TILE_TEXTURE_KEY,
  MARSH_WALL_TILE_TEXTURE_KEY,
  TEMPEST_CAMP_FLOOR_TILE_TEXTURE_KEY,
  TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY,
  TEMPEST_VILLAGE_FLOOR_TILE_TEXTURE_KEY
} from '../render/overworldTileArt';
import overworldRimuruSlimeUrl from '../assets/sprites/overworld-rimuru-slime.webp';
import enemyForestSlimeUrl from '../assets/sprites/enemy-forest-slime.webp';
import enemyDirewolfPupUrl from '../assets/sprites/enemy-direwolf-pup.webp';
import enemySporeMothUrl from '../assets/sprites/enemy-spore-moth.webp';
import enemyOrcScoutUrl from '../assets/sprites/enemy-orc-scout.webp';
import enemyLizardmanAcolyteUrl from '../assets/sprites/enemy-lizardman-acolyte.webp';
import enemyBogTerrorUrl from '../assets/sprites/enemy-bog-terror.webp';
import enemyOrcSoldierUrl from '../assets/sprites/enemy-orc-soldier.webp';
import enemyOrcGeneralUrl from '../assets/sprites/enemy-orc-general.webp';
import enemyOrcDisasterUrl from '../assets/sprites/enemy-orc-disaster.webp';
import enemyLizardmanWarriorUrl from '../assets/sprites/enemy-lizardman-warrior.webp';
import enemyGabiruUrl from '../assets/sprites/enemy-gabiru.webp';
import enemyMaskedMajinUrl from '../assets/sprites/enemy-masked-majin.webp';
import enemyIfritUrl from '../assets/sprites/enemy-ifrit.webp';
import enemyDirewolfAlphaUrl from '../assets/sprites/enemy-direwolf-alpha.webp';
import enemyNamelessEchoUrl from '../assets/sprites/enemy-nameless-echo.webp';
import enemyOgreWarriorUrl from '../assets/sprites/enemy-ogre-warrior.webp';
import enemyMagicColossusUrl from '../assets/sprites/enemy-magic-colossus.png';
import kingdomUnitsUrl from '../assets/sprites/kingdom-board-units.webp';
import academyWispUrl from '../assets/sprites/enemy-academy-wisp.webp';
import blumundBanditUrl from '../assets/sprites/enemy-blumund-bandit.webp';
import humanLancerUrl from '../assets/sprites/enemy-human-lancer.webp';
import humanDeserterUrl from '../assets/sprites/enemy-human-deserter.webp';
import mordrahnUrl from '../assets/sprites/enemy-mordrahn.webp';
import rimuruBattleUrl from '../assets/sprites/party-rimuru.webp';
import gobtaBattleUrl from '../assets/sprites/party-gobta.webp';
import rigurdBattleUrl from '../assets/sprites/party-rigurd.webp';
import rangaBattleUrl from '../assets/sprites/party-ranga.webp';
import shunaBattleUrl from '../assets/sprites/party-shuna.webp';
import benimaruBattleUrl from '../assets/sprites/party-benimaru.webp';
import shionBattleUrl from '../assets/sprites/party-shion.webp';
import hakurouBattleUrl from '../assets/sprites/party-hakurou.webp';
import soueiBattleUrl from '../assets/sprites/party-souei.webp';
import rimuruPortraitUrl from '../assets/sprites/portrait-rimuru.webp';
import gobtaPortraitUrl from '../assets/sprites/portrait-gobta.webp';
import shunaPortraitUrl from '../assets/sprites/portrait-shuna.webp';
import rigurdPortraitUrl from '../assets/sprites/portrait-rigurd.webp';
import rangaPortraitUrl from '../assets/sprites/portrait-ranga.webp';
import veldoraPortraitUrl from '../assets/sprites/portrait-veldora.webp';
import shizuPortraitUrl from '../assets/sprites/portrait-shizu.webp';
import shizuChildrenPortraitUrl from '../assets/sprites/portrait-shizu-children.png';
import fuzePortraitUrl from '../assets/sprites/portrait-fuze.webp';
import benimaruPortraitUrl from '../assets/sprites/portrait-benimaru.webp';
import shionPortraitUrl from '../assets/sprites/portrait-shion.webp';
import hakurouPortraitUrl from '../assets/sprites/portrait-hakurou.webp';
import kurobePortraitUrl from '../assets/sprites/portrait-kurobe.webp';
import soueiPortraitUrl from '../assets/sprites/portrait-souei.webp';
import kaijinPortraitUrl from '../assets/sprites/portrait-kaijin.webp';
import eirPortraitUrl from '../assets/sprites/portrait-eir.webp';
import kaelPortraitUrl from '../assets/sprites/portrait-kael.webp';
import gazelPortraitUrl from '../assets/sprites/portrait-gazel.webp';
import blumundAdventurersPortraitUrl from '../assets/sprites/portrait-blumund-adventurers.webp';
import treyniPortraitUrl from '../assets/sprites/portrait-treyni.webp';
import milimPortraitUrl from '../assets/sprites/portrait-milim.webp';
import soukaPortraitUrl from '../assets/sprites/portrait-souka.webp';
import tempestGroveBattleUrl from '../assets/backgrounds/battle-tempest-grove.webp';
import whisperingGroveBattleUrl from '../assets/backgrounds/battle-whispering-grove.webp';
import sealedCaveBattleUrl from '../assets/backgrounds/battle-sealed-cave.webp';
import direwolfDenBattleUrl from '../assets/backgrounds/battle-direwolf-den.webp';
import ancestorSealBattleUrl from '../assets/backgrounds/battle-ancestor-seal.webp';
import spiritMarshBattleUrl from '../assets/backgrounds/battle-spirit-marsh.webp';
import spiritHighlandsBattleUrl from '../assets/backgrounds/battle-spirit-highlands.webp';
import ogreRuinsBattleUrl from '../assets/backgrounds/battle-ogre-ruins.webp';
import orcBattlefieldBattleUrl from '../assets/backgrounds/battle-orc-battlefield.webp';
import lizardmanMarshBattleUrl from '../assets/backgrounds/battle-lizardman-marsh.webp';
import spiritCaveBattleUrl from '../assets/backgrounds/battle-spirit-cave.webp';
import milimArrivalBattleUrl from '../assets/backgrounds/battle-milim-arrival.webp';
import tempestColosseumBattleUrl from '../assets/backgrounds/battle-tempest-colosseum.png';
import tempestInvasionBattleUrl from '../assets/backgrounds/battle-tempest-invasion.png';
import regionSealedCaveUrl from '../assets/ui/region-sealed-cave.webp';
import regionGoblinVillageUrl from '../assets/ui/region-goblin-village.webp';
import regionDirewolfDenUrl from '../assets/ui/region-direwolf-den.webp';
import regionJuraForestUrl from '../assets/ui/region-jura-forest.webp';
import regionSpiritMarshUrl from '../assets/ui/region-spirit-marsh.webp';
import regionSpiritHighlandsUrl from '../assets/ui/region-spirit-highlands.webp';
import regionDwargonUrl from '../assets/ui/region-dwargon.webp';
import regionJuraBattlefieldUrl from '../assets/ui/region-jura-battlefield.webp';
import regionLizardmanMarshUrl from '../assets/ui/region-lizardman-marsh.webp';
import regionEmberHollowUrl from '../assets/ui/region-ember-hollow.webp';
import regionBlumundUrl from '../assets/ui/region-blumund.webp';
import regionFreedomAcademyUrl from '../assets/ui/region-freedom-academy.png';
import regionTempestColosseumUrl from '../assets/ui/region-tempest-colosseum.png';
import regionRamirisLabyrinthUrl from '../assets/ui/region-ramiris-labyrinth.png';
import regionTempestCampUrl from '../assets/ui/region-tempest-camp.webp';
import regionTempestVillageUrl from '../assets/ui/region-tempest-village.webp';
import regionTempestCityUrl from '../assets/ui/region-tempest-city.webp';
import formationRowsUrl from '../assets/ui/formation-rows.webp';
import mimicFormUrl from '../assets/ui/mimic-form-indicator.jpg';
import praedatorStealUrl from '../assets/ui/praedator-steal-hud.jpg';

// Lädt globale Assets mit Fortschrittsbalken.
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    configureHiDpiScene(this);
    const barW = 280;
    const x = (GAME_WIDTH - barW) / 2;
    const y = GAME_HEIGHT / 2;

    const frame = this.add.rectangle(GAME_WIDTH / 2, y, barW + 6, 22).setStrokeStyle(2, 0x4a5876);
    const fill = this.add.rectangle(x, y, 1, 14, 0x68d7ff).setOrigin(0, 0.5);
    this.add.text(GAME_WIDTH / 2, y - 30, 'Lade …', { fontFamily: 'sans-serif', fontSize: '16px', color: '#cbd6e8' }).setOrigin(0.5);

    this.load.on('progress', (p: number) => { fill.width = barW * p; });
    this.load.on('complete', () => { frame.destroy(); fill.destroy(); });

    // Echte CC0-Kacheln laden (Kenney Tiny Town).
    this.load.image('tile-grass', grassUrl);
    this.load.image('tile-wall', wallUrl);
    this.load.image('tile-path', pathUrl);
    this.load.image(MARSH_FLOOR_TILE_TEXTURE_KEY, marshFloorTileUrl);
    this.load.image(MARSH_WALL_TILE_TEXTURE_KEY, marshWallTileUrl);
    this.load.image(HIGHLANDS_FLOOR_TILE_TEXTURE_KEY, highlandsFloorTileUrl);
    this.load.image(HIGHLANDS_WALL_TILE_TEXTURE_KEY, highlandsWallTileUrl);
    this.load.image(BLUMUND_FLOOR_TILE_TEXTURE_KEY, blumundFloorTileUrl);
    this.load.image(BLUMUND_WALL_TILE_TEXTURE_KEY, blumundWallTileUrl);
    this.load.image(DWARGON_FLOOR_TILE_TEXTURE_KEY, dwargonFloorTileUrl);
    this.load.image(DWARGON_WALL_TILE_TEXTURE_KEY, dwargonWallTileUrl);
    this.load.image(JURA_BATTLEFIELD_FLOOR_TILE_TEXTURE_KEY, juraBattlefieldFloorTileUrl);
    this.load.image(JURA_BATTLEFIELD_WALL_TILE_TEXTURE_KEY, juraBattlefieldWallTileUrl);
    this.load.image(LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY, lizardmanMarshFloorTileUrl);
    this.load.image(LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY, lizardmanMarshWallTileUrl);
    this.load.image(EMBER_HOLLOW_FLOOR_TILE_TEXTURE_KEY, emberHollowFloorTileUrl);
    this.load.image(EMBER_HOLLOW_WALL_TILE_TEXTURE_KEY, emberHollowWallTileUrl);
    this.load.image(TEMPEST_CAMP_FLOOR_TILE_TEXTURE_KEY, tempestCampFloorTileUrl);
    this.load.image(TEMPEST_VILLAGE_FLOOR_TILE_TEXTURE_KEY, tempestVillageFloorTileUrl);
    this.load.image(TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY, tempestCityFloorTileUrl);
    // Hochaufgeloeste Projekt-Sprites; die Legacy-Keys bleiben als robuste Aliasse.
    this.load.image('sprite-hero', overworldRimuruSlimeUrl);
    this.load.image(OVERWORLD_RIMURU_TEXTURE_KEY, overworldRimuruSlimeUrl);
    this.load.image('sprite-enemy-slime', enemyForestSlimeUrl);
    this.load.image(FOREST_SLIME_TEXTURE_KEY, enemyForestSlimeUrl);
    this.load.image(DIREWOLF_PUP_TEXTURE_KEY, enemyDirewolfPupUrl);
    this.load.image(SPORE_MOTH_TEXTURE_KEY, enemySporeMothUrl);
    this.load.image(ORC_SCOUT_TEXTURE_KEY, enemyOrcScoutUrl);
    this.load.image(LIZARDMAN_ACOLYTE_TEXTURE_KEY, enemyLizardmanAcolyteUrl);
    this.load.image(BOG_TERROR_TEXTURE_KEY, enemyBogTerrorUrl);
    this.load.image(ORC_SOLDIER_TEXTURE_KEY, enemyOrcSoldierUrl);
    this.load.image(ORC_GENERAL_TEXTURE_KEY, enemyOrcGeneralUrl);
    this.load.image(ORC_DISASTER_TEXTURE_KEY, enemyOrcDisasterUrl);
    this.load.image(LIZARDMAN_WARRIOR_TEXTURE_KEY, enemyLizardmanWarriorUrl);
    this.load.image(GABIRU_TEXTURE_KEY, enemyGabiruUrl);
    this.load.image(MASKED_MAJIN_TEXTURE_KEY, enemyMaskedMajinUrl);
    this.load.image(IFRIT_TEXTURE_KEY, enemyIfritUrl);
    this.load.image(DIREWOLF_ALPHA_TEXTURE_KEY, enemyDirewolfAlphaUrl);
    this.load.image(NAMELESS_ECHO_TEXTURE_KEY, enemyNamelessEchoUrl);
    this.load.image(MAGIC_COLOSSUS_TEXTURE_KEY, enemyMagicColossusUrl);
    this.load.image('sprite-enemy-wolf', enemyDirewolfPupUrl);
    this.load.image('sprite-enemy-imp', enemyNamelessEchoUrl);
    this.load.image('sprite-enemy-ogre', enemyOgreWarriorUrl);
    this.load.image(OGRE_WARRIOR_TEXTURE_KEY, enemyOgreWarriorUrl);
    this.load.image(KINGDOM_UNIT_TEXTURE_KEY, kingdomUnitsUrl);
    this.load.image(ACADEMY_WISP_TEXTURE_KEY, academyWispUrl);
    this.load.image(BLUMUND_BANDIT_TEXTURE_KEY, blumundBanditUrl);
    this.load.image('sprite-enemy-human-lancer', humanLancerUrl);
    this.load.image('sprite-enemy-human-deserter', humanDeserterUrl);
    this.load.image('sprite-enemy-mordrahn', mordrahnUrl);
    this.load.image(PARTY_BATTLE_ART.rimuru, rimuruBattleUrl);
    this.load.image(PARTY_BATTLE_ART.gobta, gobtaBattleUrl);
    this.load.image(PARTY_BATTLE_ART.rigurd, rigurdBattleUrl);
    this.load.image(PARTY_BATTLE_ART.ranga, rangaBattleUrl);
    this.load.image(PARTY_BATTLE_ART.shuna, shunaBattleUrl);
    this.load.image(PARTY_BATTLE_ART.benimaru, benimaruBattleUrl);
    this.load.image(PARTY_BATTLE_ART.shion, shionBattleUrl);
    this.load.image(PARTY_BATTLE_ART.hakurou, hakurouBattleUrl);
    this.load.image(PARTY_BATTLE_ART.souei, soueiBattleUrl);
    this.load.image(portraitKey('rimuru'), rimuruPortraitUrl);
    this.load.image(portraitKey('gobta'), gobtaPortraitUrl);
    this.load.image(portraitKey('shuna'), shunaPortraitUrl);
    this.load.image(portraitKey('rigurd'), rigurdPortraitUrl);
    this.load.image(portraitKey('ranga'), rangaPortraitUrl);
    this.load.image(portraitKey('storm-dragon'), veldoraPortraitUrl);
    this.load.image(portraitKey('shizu'), shizuPortraitUrl);
    this.load.image(portraitKey('shizu-children'), shizuChildrenPortraitUrl);
    this.load.image(portraitKey('fuze'), fuzePortraitUrl);
    this.load.image(portraitKey('benimaru'), benimaruPortraitUrl);
    this.load.image(portraitKey('shion'), shionPortraitUrl);
    this.load.image(portraitKey('hakurou'), hakurouPortraitUrl);
    this.load.image(portraitKey('kurobe'), kurobePortraitUrl);
    this.load.image(portraitKey('souei'), soueiPortraitUrl);
    this.load.image(portraitKey('kaijin'), kaijinPortraitUrl);
    this.load.image(portraitKey('eir'), eirPortraitUrl);
    this.load.image(portraitKey('kael'), kaelPortraitUrl);
    this.load.image(portraitKey('gazel'), gazelPortraitUrl);
    this.load.image(portraitKey('blumund-adventurers'), blumundAdventurersPortraitUrl);
    this.load.image(portraitKey('treyni'), treyniPortraitUrl);
    this.load.image(portraitKey('milim'), milimPortraitUrl);
    this.load.image(portraitKey('souka'), soukaPortraitUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['tempest-grove'], tempestGroveBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['whispering-grove'], whisperingGroveBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['sealed-cave'], sealedCaveBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['direwolf-den'], direwolfDenBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['ancestor-seal'], ancestorSealBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['spirit-marsh'], spiritMarshBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['spirit-highlands'], spiritHighlandsBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['ogre-ruins'], ogreRuinsBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['orc-battlefield'], orcBattlefieldBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['lizardman-marsh'], lizardmanMarshBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['spirit-cave'], spiritCaveBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['milim-arrival'], milimArrivalBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['tempest-colosseum'], tempestColosseumBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['tempest-invasion'], tempestInvasionBattleUrl);
    this.load.image(REGION_BANNER_TEXTURES['sealed-cave'], regionSealedCaveUrl);
    this.load.image(REGION_BANNER_TEXTURES['goblin-village'], regionGoblinVillageUrl);
    this.load.image(REGION_BANNER_TEXTURES['direwolf-den'], regionDirewolfDenUrl);
    this.load.image(REGION_BANNER_TEXTURES['tempest-start'], regionJuraForestUrl);
    this.load.image(REGION_BANNER_TEXTURES['spirit-marsh'], regionSpiritMarshUrl);
    this.load.image(REGION_BANNER_TEXTURES['spirit-highlands'], regionSpiritHighlandsUrl);
    this.load.image(REGION_BANNER_TEXTURES['dwargon'], regionDwargonUrl);
    this.load.image(REGION_BANNER_TEXTURES['jura-battlefield'], regionJuraBattlefieldUrl);
    this.load.image(REGION_BANNER_TEXTURES['lizardman-marsh'], regionLizardmanMarshUrl);
    this.load.image(REGION_BANNER_TEXTURES['ember-hollow'], regionEmberHollowUrl);
    this.load.image(REGION_BANNER_TEXTURES['blumund'], regionBlumundUrl);
    this.load.image(REGION_BANNER_TEXTURES['freedom-academy'], regionFreedomAcademyUrl);
    this.load.image(REGION_BANNER_TEXTURES['tempest-colosseum'], regionTempestColosseumUrl);
    this.load.image(REGION_BANNER_TEXTURES['ramiris-labyrinth'], regionRamirisLabyrinthUrl);
    this.load.image(TEMPEST_GROWTH_BANNER_TEXTURES.camp, regionTempestCampUrl);
    this.load.image(TEMPEST_GROWTH_BANNER_TEXTURES.village, regionTempestVillageUrl);
    this.load.image(TEMPEST_GROWTH_BANNER_TEXTURES.city, regionTempestCityUrl);
    this.load.image('ui-formation-rows', formationRowsUrl);
    this.load.image('ui-mimic-form-indicator', mimicFormUrl);
    this.load.image('ui-praedator-steal-hud', praedatorStealUrl);
  }

  create(): void {
    this.registerKingdomUnitFrames();
    // Prozedurale Platzhalter-Texturen (ph-<kind>) erzeugen — global verfügbar,
    // bis echte CC0-Assets eingepflegt sind. Szenen nutzen sie mit Rechteck-Fallback.
    generatePlaceholderTextures(this);
    // Prozedurale Portraits (portrait-<kind>) für Dialog-/Menü-UI.
    generatePortraitTextures(this);
    // Prozeduraler Pixel-VFX-Atlas (vfx-<kind>) für Kampf-Feedback.
    generateVfxTextures(this);
    // Prozedurale Fallbacks, falls die dedizierten Prolog-WebPs nicht geladen wurden.
    generatePrologueBattleBackgrounds(this);
    this.applyConfiguredTextureFilters();
    this.scene.start('Title');
  }

  private registerKingdomUnitFrames(): void {
    const texture = this.textures.get(KINGDOM_UNIT_TEXTURE_KEY);
    const source = texture.getSourceImage();
    const frameWidth = source.width / KINGDOM_UNIT_ATLAS.columns;
    const frameHeight = source.height / KINGDOM_UNIT_ATLAS.rows;

    for (const [name, frame] of Object.entries(KINGDOM_UNIT_FRAMES)) {
      if (!texture.has(name)) {
        texture.add(
          name,
          0,
          frame.col * frameWidth,
          frame.row * frameHeight,
          frameWidth,
          frameHeight
        );
      }
    }
  }

  private applyConfiguredTextureFilters(): void {
    const linearTextureKeys = [
      KINGDOM_UNIT_TEXTURE_KEY,
      MARSH_FLOOR_TILE_TEXTURE_KEY,
      MARSH_WALL_TILE_TEXTURE_KEY,
      HIGHLANDS_FLOOR_TILE_TEXTURE_KEY,
      HIGHLANDS_WALL_TILE_TEXTURE_KEY,
      BLUMUND_FLOOR_TILE_TEXTURE_KEY,
      BLUMUND_WALL_TILE_TEXTURE_KEY,
      DWARGON_FLOOR_TILE_TEXTURE_KEY,
      DWARGON_WALL_TILE_TEXTURE_KEY,
      JURA_BATTLEFIELD_FLOOR_TILE_TEXTURE_KEY,
      JURA_BATTLEFIELD_WALL_TILE_TEXTURE_KEY,
      LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
      LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY,
      EMBER_HOLLOW_FLOOR_TILE_TEXTURE_KEY,
      EMBER_HOLLOW_WALL_TILE_TEXTURE_KEY,
      TEMPEST_CAMP_FLOOR_TILE_TEXTURE_KEY,
      TEMPEST_VILLAGE_FLOOR_TILE_TEXTURE_KEY,
      TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY,
      OVERWORLD_RIMURU_TEXTURE_KEY,
      FOREST_SLIME_TEXTURE_KEY,
      SPORE_MOTH_TEXTURE_KEY,
      ORC_SCOUT_TEXTURE_KEY,
      LIZARDMAN_ACOLYTE_TEXTURE_KEY,
      BOG_TERROR_TEXTURE_KEY,
      ORC_SOLDIER_TEXTURE_KEY,
      ORC_GENERAL_TEXTURE_KEY,
      ORC_DISASTER_TEXTURE_KEY,
      LIZARDMAN_WARRIOR_TEXTURE_KEY,
      GABIRU_TEXTURE_KEY,
      MASKED_MAJIN_TEXTURE_KEY,
      IFRIT_TEXTURE_KEY,
      DIREWOLF_ALPHA_TEXTURE_KEY,
      DIREWOLF_PUP_TEXTURE_KEY,
      NAMELESS_ECHO_TEXTURE_KEY,
      OGRE_WARRIOR_TEXTURE_KEY,
      'sprite-hero',
      'sprite-enemy-slime',
      'sprite-enemy-wolf',
      'sprite-enemy-imp',
      'sprite-enemy-ogre',
      portraitKey('rimuru'),
      portraitKey('gobta'),
      portraitKey('shuna'),
      portraitKey('rigurd'),
      portraitKey('ranga'),
      portraitKey('storm-dragon'),
      portraitKey('shizu'),
      portraitKey('shizu-children'),
      portraitKey('fuze'),
      portraitKey('benimaru'),
      portraitKey('shion'),
      portraitKey('hakurou'),
      portraitKey('kurobe'),
      portraitKey('souei'),
      portraitKey('kaijin'),
      portraitKey('eir'),
      portraitKey('kael'),
      portraitKey('gazel'),
      portraitKey('blumund-adventurers'),
      portraitKey('treyni'),
      portraitKey('milim'),
      portraitKey('souka'),
      'sprite-enemy-human-lancer',
      'sprite-enemy-human-deserter',
      'sprite-enemy-mordrahn',
      ACADEMY_WISP_TEXTURE_KEY,
      BLUMUND_BANDIT_TEXTURE_KEY,
      ...Object.values(PARTY_BATTLE_ART),
      ...Object.values(BATTLE_ARENA_TEXTURES),
      ...Object.values(REGION_BANNER_TEXTURES),
      ...Object.values(TEMPEST_GROWTH_BANNER_TEXTURES),
      ...VFX_KINDS.map(vfxKey)
    ];

    const pixelTextureKeys = [
      ...KENNEY_PIXEL_TEXTURE_KEYS,
      ...PLACEHOLDER_KINDS.map(placeholderKey)
    ];

    this.applyTextureFilter(linearTextureKeys, Phaser.Textures.FilterMode.LINEAR);
    this.applyTextureFilter(pixelTextureKeys, Phaser.Textures.FilterMode.NEAREST);
  }

  private applyTextureFilter(keys: readonly string[], filter: Phaser.Textures.FilterMode): void {
    keys.forEach((key) => {
      if (this.textures.exists(key)) this.textures.get(key).setFilter(filter);
    });
  }
}
