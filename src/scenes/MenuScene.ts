import Phaser from 'phaser';
import type { EquipmentSlot, SkillTreeNodeDefinition } from '../data';
import { SKILL_TIER_META, skillTierBadge } from '../data';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
import { buildRangaTravelView, resolveRangaTravel, type RangaTravelStatus } from '../systems/rangaTravel';
import { canPresentRangaJourney } from '../systems/rangaJourney';
import {
  buildMenuView,
  EQUIPMENT_SLOTS,
  equipItem,
  MENU_TOUCH_TARGET_PX,
  type MenuGameState,
  type MenuView,
  applyPartyFormationToMenuState,
  unequipItem,
  useItem
} from '../systems/menu';
import { activateReserveMember } from '../systems/partyFormation';
import {
  calculateProgressionStats,
  canAwakenTempest,
  canUnlockSkillNode,
  enchantEquipment,
  evolveMember,
  getActiveEquipmentSetTiers,
  getActiveEvolution,
  getAvailableEvolutions,
  getEnchantmentLevel,
  getProgressionRelationships,
  getProgressionSkills,
  getRelationshipLevelNumber,
  getSkillFusionViews,
  getSkillTree,
  fuseMemberSkill,
  renameMember,
  unlockSkillNode,
  awakenTempest,
  AWAKENING_MAGICULE_COST,
  AWAKENING_SCENE_FLAG,
  type ProgressionActionResult
} from '../systems/progression';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { buildForgeView, craftRecipe, type CraftContext } from '../systems/crafting';
import { buildResearchView, completeResearchProject, type ResearchContext } from '../systems/research';
import { buildResidentRoster, promoteResident as promoteResidentRule, RESIDENT_PROMOTION_MAGICULE_COST } from '../systems/residents';
import { buildFacilityOverview, runProductionCycle } from '../systems/facilities';
import { buildDiplomacyView, MAX_REPUTATION } from '../systems/diplomacy';
import { buildBountyBoardView, claimBounty, getBounty, type BountyContext } from '../systems/bounties';
import { tempestGrowthLabel } from '../systems/tempestGrowth';
import { buildCodexView, buildDevourCompendium, buildQuestLog, canEnchantEquipment, createWorldState, type QuestLogEntryView } from '../systems/world';
import { addUiPanel, addUiPortraitFrame, addUiTextButton } from '../render/uiSkin';
import {
  MENU_LIST_BOTTOM,
  MENU_LIST_COLUMNS,
  MENU_PAGER_HEIGHT,
  MENU_PARTY_LAYOUT,
  MENU_TAB_ROW,
  menuTabButtonX,
  paginateMenuList,
  type MenuListColumn,
  type MenuListPage
} from '../systems/menuLayout';
import { portraitKey } from '../render/portraitAtlas';
import { PORTRAIT_KINDS, type PortraitKind } from '../render/artSpec';
import { clampSpecTreePan, layoutSpecTree } from '../systems/specTreeLayout';
import { committedBranch, describeNodePerks, describePerk } from '../systems/talentPerk';

type MenuTab = 'party' | 'inventory' | 'equipment' | 'status' | 'growth' | 'quests' | 'codex' | 'travel';
type QuestStatusFilter = 'active' | 'completed';

const TABS: ReadonlyArray<{ id: MenuTab; label: string }> = [
  { id: 'party', label: 'Party' },
  { id: 'inventory', label: 'Inventar' },
  { id: 'equipment', label: 'Ausrüstung' },
  { id: 'status', label: 'Status' },
  { id: 'growth', label: 'Talente' },
  { id: 'quests', label: 'Quests' },
  { id: 'codex', label: 'Codex' },
  { id: 'travel', label: 'Ranga' }
];

// Tabs, die sich auf eine ausgewählte Figur beziehen → nur hier wird die Party-Liste
// als Auswahl-Seitenleiste gebraucht. Der Party-Tab hat seine eigene (klickbare)
// Aktiv-Gruppen-Übersicht, sonst stünde die Liste doppelt; Quests/Codex/Reise
// nutzen die volle Breite.
const CHARACTER_TABS: ReadonlySet<MenuTab> = new Set<MenuTab>(['inventory', 'equipment', 'status', 'growth']);

// Kurzbeschreibung pro Tab — erklärt, was der Menüpunkt macht.
const TAB_DESCRIPTIONS: Readonly<Record<MenuTab, string>> = {
  party: 'Überblick über deine aktive Gruppe.',
  inventory: 'Gegenstände ansehen und an einer Figur benutzen.',
  equipment: 'Waffe, Rüstung und Accessoire anlegen oder ablegen.',
  status: 'Werte, Skills, Namensgebung, Entwicklung und Bindungen der Figur.',
  growth: 'Talentbaum: Knoten mit Skillpunkten freischalten.',
  quests: 'Aktive Aufträge verfolgen; Abgeschlossenes wandert ins Archiv.',
  codex: 'Gesammeltes Wissen über Welt, Figuren und Gegner.',
  travel: 'Mit Ranga zu entdeckten, sicheren Orten schnellreisen.'
};

export class MenuScene extends Phaser.Scene {
  private save!: SaveGameV2;
  private state!: MenuGameState;
  private selectedTab: MenuTab = 'party';
  private selectedMemberIndex = 0;
  private codexPage = 0;
  private codexMode: 'lore' | 'devour' | 'residents' | 'facilities' | 'bounties' | 'diplomacy' = 'lore';
  private listPages: Record<string, number> = {};
  private questPage = 0;
  private questStatus: QuestStatusFilter = 'active';
  private selectedQuestId: string | null = null;
  private selectedTalentNodeId: string | null = null;
  // Phase 91 — Schmiede-Ansicht innerhalb des Ausrüstungs-Tabs (nur am Schmied).
  private showForge = false;
  private specTreePanY = 0;
  private specTreeMask?: Phaser.GameObjects.Graphics;
  private layer!: Phaser.GameObjects.Container;
  private message = TAB_DESCRIPTIONS.party;

  constructor() {
    super('Menu');
  }

  create(): void {
    configureHiDpiScene(this);
    this.save = loadSave(window.localStorage) ?? createNewSave();
    this.state = {
      party: this.save.party.active,
      reserve: this.save.party.reserve,
      inventory: this.save.inventory.stacks,
      gold: this.save.party.gold,
      flags: this.save.flags,
      quests: this.save.quests
    };

    // Vollflaechiger, deckender Backdrop: das Menue ist eine Vollbild-Uebernahme,
    // die pausierte Overworld darf nicht durchscheinen. Grosszuegig ueberdimensioniert
    // und scroll-fixiert, damit die Deckung unabhaengig von Kamera/Skalierung haelt.
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 2, GAME_HEIGHT * 2, 0x05070d, 1)
      .setScrollFactor(0);
    this.layer = this.add.container(0, 0);
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-M', () => this.close());
    // Phase 119: basic keyboard for menu (extended for party + other)
    this.input.keyboard?.on('keydown-LEFT', () => this.moveMenuSelection(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveMenuSelection(1));
    this.input.keyboard?.on('keydown-UP', () => this.moveMenuSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveMenuSelection(1));
    this.input.keyboard?.on('keydown-SPACE', () => this.activateMenuSelection());
    this.input.keyboard?.on('keydown-ENTER', () => this.activateMenuSelection());
    this.refresh();
  }

  private refresh(): void {
    this.specTreeMask?.destroy();
    this.specTreeMask = undefined;
    this.layer.removeAll(true);
    const view = buildMenuView(this.state);
    const selected = view.members[this.selectedMemberIndex] ?? view.members[0];

    this.layer.add(this.add.text(24, 18, 'Tempest-Menü', {
      fontFamily: 'serif',
      fontSize: '30px',
      color: '#e9c56c'
    }));
    const resources = `${view.gold} Gold · ${this.save.progression.magicules} Magicules`;
    this.layer.add(this.add.text(24, 52, `${resources} · ${this.message}`, {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#9fb2cc'
    }));
    this.button(GAME_WIDTH - 126, 34, 104, 'Schließen', () => this.close(), 0x3a2230);

    TABS.forEach((tab, index) => {
      this.button(menuTabButtonX(index, TABS.length), MENU_TAB_ROW.y, MENU_TAB_ROW.buttonWidth, tab.label, () => {
        this.selectedTab = tab.id;
        // Beim Tabwechsel die Kurzbeschreibung in die Meldungszeile setzen, damit klar
        // ist, was der Menüpunkt macht; Aktions-Feedback überschreibt sie danach.
        this.message = TAB_DESCRIPTIONS[tab.id];
        this.codexPage = 0;
        this.listPages = {};
        this.questPage = 0;
        this.questStatus = 'active';
        this.selectedQuestId = null;
        this.selectedTalentNodeId = null;
        this.showForge = false;
        this.refresh();
      }, this.selectedTab === tab.id ? 0x30506f : 0x1b2940);
    });

    // Party-Auswahlleiste nur auf Figur-bezogenen Tabs — sonst verschwendet sie Platz
    // (und überlappte vorher die Quest-/Codex-Inhalte).
    if (CHARACTER_TABS.has(this.selectedTab)) this.drawMemberList(view);

    if (!selected) {
      this.layer.add(this.add.text(300, 160, 'Keine Party vorhanden.', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#e9eef7'
      }));
      return;
    }

    if (this.selectedTab === 'party') this.drawParty(selected.character.name, view);
    else if (this.selectedTab === 'inventory') this.drawInventory(view, selected.member.characterId);
    else if (this.selectedTab === 'equipment') this.drawEquipment(view, selected.member.characterId);
    else if (this.selectedTab === 'status') this.drawStatus(view, selected.member.characterId);
    else if (this.selectedTab === 'growth') this.drawGrowth(view, selected.member.characterId);
    else if (this.selectedTab === 'quests') this.drawQuestLog(view);
    else if (this.selectedTab === 'codex') this.drawCodex();
    else this.drawRangaTravel();
  }

  private drawMemberList(view: MenuView): void {
    this.layer.add(this.add.text(24, 136, 'Party', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#cdeaff'
    }));

    view.members.forEach((summary, index) => {
      // Eintragshöhe 70: 44px-Button + LP/MP-Zeile darunter, ohne dass die
      // Unterzeile die Button-Border kreuzt (vorher „durchgestrichener" Text).
      const y = 170 + index * 70;
      const stats = calculateProgressionStats(
        summary.member,
        this.save.progression
      );
      this.button(24, y, 232, `${summary.member.name}  Lv.${summary.member.level}`, () => {
        this.selectedMemberIndex = index;
        this.refresh();
      }, this.selectedMemberIndex === index ? 0x30506f : 0x162238);
      this.layer.add(this.add.text(34, y + 30, `LP ${summary.member.currentHp}/${stats.maxHp} · MP ${summary.member.currentMp}/${stats.maxMp}`, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#9fb2cc'
      }));
    });
  }

  private drawParty(_selectedName: string, view: MenuView): void {
    const active = MENU_PARTY_LAYOUT.active;
    const reserve = MENU_PARTY_LAYOUT.reserve;

    this.layer.add(this.add.text(MENU_PARTY_LAYOUT.titleX, MENU_PARTY_LAYOUT.titleY, 'Party-Übersicht', {
      fontFamily: 'sans-serif',
      fontSize: '19px',
      color: '#e9c56c'
    }).setOrigin(0.5, 0));
    this.layer.add(this.add.text(active.left, MENU_PARTY_LAYOUT.headingY, 'Aktive Gruppe · maximal 3', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#cdeaff'
    }));
    view.members.forEach((summary, index) => {
      const y = active.firstY + index * active.rowHeight;
      const stats = calculateProgressionStats(
        summary.member,
        this.save.progression
      );
      const formName = getActiveEvolution(
        this.save.progression,
        summary.member.characterId
      )?.formName ?? summary.character.species;
      this.panel(active.left, y, active.width, active.cardHeight);
      // Karte als Auswahl klickbar — sie ersetzt die linke Party-Liste auf diesem Tab.
      const hit = this.add.rectangle(active.left + active.width / 2, y, active.width, active.cardHeight, 0x000000, 0.001).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => { this.selectedMemberIndex = index; this.refresh(); });
      this.layer.add(hit);
      this.drawPortrait(summary.member.characterId, active.left + 36, y, 46);
      this.layer.add(this.add.text(active.left + 72, y - 31, `${summary.member.name} · ${formName}`, {
        fontFamily: 'sans-serif',
        fontSize: '15px', color: index === this.selectedMemberIndex ? '#e9c56c' : '#e9eef7'
      }));
      this.layer.add(this.add.text(active.left + 72, y - 8, summary.character.role, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc'
      }));
      this.layer.add(this.add.text(active.left + 72, y + 12, `LP ${summary.member.currentHp}/${stats.maxHp} · MP ${summary.member.currentMp}/${stats.maxMp}`, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#9fb2cc'
      }));
    });

    this.layer.add(this.add.text(reserve.left, MENU_PARTY_LAYOUT.headingY, 'Reserve', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#cdeaff'
    }));
    if (view.reserveMembers.length === 0) {
      this.layer.add(this.add.text(reserve.left, reserve.emptyY, 'Noch keine Reserve.', {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#6f83a5'
      }));
    }
    view.reserveMembers.slice(0, 6).forEach((summary, index) => {
      const y = reserve.firstY + index * reserve.rowHeight;
      this.button(reserve.left, y, reserve.width, `${summary.member.name} · Lv.${summary.member.level}`, () => {
        const selectedActive = view.members[this.selectedMemberIndex]?.member.characterId;
        const formation = activateReserveMember(
          { active: this.state.party, reserve: this.state.reserve ?? [] },
          summary.member.characterId,
          selectedActive
        );
        this.applyResult(applyPartyFormationToMenuState(this.state, formation));
      }, 0x243447);
    });
    if (view.reserveMembers.length > 0) {
      this.layer.add(this.add.text(reserve.left, reserve.footnoteY, 'Bei voller Gruppe ersetzt der Klick\ndie oben gewählte Aktiv-Karte.', {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc'
      }));
    }
  }

  private drawInventory(view: MenuView, characterId: string): void {
    this.sectionTitle('Inventar · antippen zum Nutzen');
    // y=126 überlappte die Haupt-Tab-Reihe (bis y=116); auf 150 unter die Tabs.
    this.button(760, 150, 120, 'Sortiert', () => {
      this.message = 'Inventar ist automatisch sortiert.';
      this.refresh();
    });

    const invCol = MENU_LIST_COLUMNS.inventoryItems;
    const inv = this.menuListPage(view.inventory.length, invCol);
    view.inventory.slice(inv.start, inv.start + inv.visible).forEach((entry, index) => {
      const y = invCol.top + index * invCol.rowHeight;
      const label = `${entry.item.name} ×${entry.quantity}`;
      this.button(300, y, 260, label, () => {
        if (!entry.usable) {
          this.message = 'Dieses Item ist hier nicht nutzbar.';
          this.refresh();
          return;
        }
        const result = useItem(this.state, entry.item.id, characterId);
        this.applyResult(result);
      }, entry.usable ? 0x1f3a2f : 0x242b38);
      this.layer.add(this.add.text(576, y - 10, entry.item.description, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#9fb2cc',
        wordWrap: { width: 310 }
      }));
    });
    this.drawListPager(invCol, inv);
  }

  private drawEquipment(view: MenuView, characterId: string): void {
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    const canEnchant = canEnchantEquipment(createWorldState(this.save), this.save.location.mapId);

    // Phase 91 — an einem Schmied lässt sich zwischen Ausrüsten und Schmieden umschalten.
    if (canEnchant) {
      this.button(474, 124, 130, this.showForge ? '◂ Ausrüstung' : 'Schmieden ▸', () => {
        this.showForge = !this.showForge;
        this.message = this.showForge
          ? 'Die Esse glüht — wähle ein Rezept.'
          : TAB_DESCRIPTIONS.equipment;
        this.refresh();
      }, this.showForge ? 0x3a2743 : 0x1f3a2f);
    } else if (this.showForge) {
      this.showForge = false;
    }

    if (this.showForge) {
      this.drawForge();
      return;
    }

    this.sectionTitle('Ausrüstung');

    EQUIPMENT_SLOTS.forEach((slot, index) => {
      const item = summary.equipmentItems[slot];
      const enchantmentLevel = getEnchantmentLevel(summary.member, this.save.progression, slot);
      // Basis 150 → 204: das erste Panel (Höhe 92, zentriert) ragte sonst mit
      // Oberkante 104 in Haupt-Tab-Reihe (bis 116) und Titel (124).
      const y = 204 + index * 100;
      this.panel(300, y, 290, 92);
      this.layer.add(this.add.text(318, y - 38, slotLabel(slot), {
        fontFamily: 'sans-serif', fontSize: '10px', color: '#9fb2cc'
      }));
      this.layer.add(this.add.text(318, y - 20, `${item?.name ?? 'Leer'}${enchantmentLevel > 0 ? ` +${enchantmentLevel}` : ''}`, {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#e9eef7'
      }));
      if (item) {
        // Aktionen in einer Zeile unten im Panel — überlappen den Item-Namen nicht mehr.
        this.button(502, y + 24, 76, 'Ablegen', () => this.applyResult(unequipItem(this.state, characterId, slot)));
        if (item.enchantment && enchantmentLevel < item.enchantment.maxLevel) {
          const cost = item.enchantment.goldCostPerLevel * (enchantmentLevel + 1);
          if (!canEnchant) {
            this.button(310, y + 24, 184, 'Verzaubern · nur bei Schmied', () => {
              this.message = 'Verzaubern geht nur bei einem Schmied — oder wenn Rimuru den Skill dafür gelernt hat.';
              this.refresh();
            }, 0x242b38);
            return;
          }
          this.button(310, y + 24, 184, `Verzaubern · ${cost} Gold`, () => {
            const result = enchantEquipment(
              summary.member,
              this.save.progression,
              slot,
              this.state.gold
            );
            this.save = { ...this.save, progression: result.state };
            this.state = { ...this.state, gold: result.gold };
            this.message = result.message;
            if (result.ok) this.persist();
            this.refresh();
          }, 0x2f2743);
        }
      }
    });

    const sets = getActiveEquipmentSetTiers(summary.member);
    this.layer.add(this.add.text(
      300,
      484,
      sets.map(({ set, pieces }) => `${set.name}: ${pieces}/${set.itemIds.length} Teile`).join(' · ')
        || 'Kein Ausrüstungsset aktiv.',
      {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#e9c56c'
      }
    ));

    this.layer.add(this.add.text(620, 126, 'Ausrüstbar aus Inventar', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#cdeaff'
    }));
    const usableCol = MENU_LIST_COLUMNS.equipUsable;
    const equippable = view.inventory.filter((entry) => entry.equipSlot);
    const usable = this.menuListPage(equippable.length, usableCol);
    equippable.slice(usable.start, usable.start + usable.visible).forEach((entry, index) => {
      this.button(usableCol.left, usableCol.top + index * usableCol.rowHeight, 260, `${entry.item.name} ×${entry.quantity}`, () => {
        this.applyResult(equipItem(this.state, characterId, entry.item.id));
      });
    });
    this.drawListPager(usableCol, usable);
  }

  private forgeContext(): CraftContext {
    return {
      inventory: this.state.inventory,
      gold: this.state.gold,
      flags: this.state.flags ?? this.save.flags,
      craftedRecipeIds: this.save.progression.craftedRecipeIds
    };
  }

  private researchContext(): ResearchContext {
    return {
      inventory: this.state.inventory,
      magicules: this.save.progression.magicules,
      flags: this.state.flags ?? this.save.flags
    };
  }

  private drawForge(): void {
    this.sectionTitle('Schmiede');
    const recipes = buildForgeView(this.forgeContext());
    if (recipes.length === 0) {
      this.layer.add(this.add.text(300, 176, 'Noch keine Rezepte freigeschaltet.', {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
      }));
      return;
    }

    recipes.forEach((row, index) => {
      const y = 176 + index * 58;
      const inputs = row.inputs
        .map((input) => `${input.name} ${input.owned}/${input.required}`)
        .join(' · ');
      this.layer.add(this.add.text(300, y, `${row.outputName}`, {
        fontFamily: 'sans-serif', fontSize: '14px', color: row.craftable ? '#e9eef7' : '#7d8aa0'
      }));
      this.layer.add(this.add.text(300, y + 20, `${inputs} · ${row.goldCost} Gold`, {
        fontFamily: 'sans-serif', fontSize: '11px',
        color: row.affordable ? '#9fb2cc' : '#c98a8a'
      }));
      this.button(660, y + 12, 150, row.craftable ? 'Schmieden' : 'Fehlt', () => {
        const result = craftRecipe(row.recipe, this.forgeContext());
        this.message = result.message;
        if (result.ok) {
          this.state = { ...this.state, inventory: result.inventory, gold: result.gold };
          this.save = {
            ...this.save,
            progression: { ...this.save.progression, craftedRecipeIds: result.craftedRecipeIds }
          };
          this.persist();
        }
        this.refresh();
      }, row.craftable ? 0x2f6f55 : 0x242b38);
    });
  }

  private drawStatus(view: MenuView, characterId: string): void {
    this.sectionTitle('Status, Entwicklung & Bindungen');
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    const stats = calculateProgressionStats(summary.member, this.save.progression);
    const formName = getActiveEvolution(this.save.progression, characterId)?.formName
      ?? summary.character.species;

    // Werte-Panel. Center 158 → 204 (Oberkante 112 ragte in Tabs/Titel);
    // alle folgenden Zeilen um dasselbe Delta (+46) mit nach unten.
    this.panel(300, 204, 570, 92);
    this.drawPortrait(characterId, 348, 208, 58);
    this.layer.add(this.add.text(392, 172, `${summary.member.name} · ${formName} · ${summary.character.role}`, {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#e9eef7'
    }));
    this.layer.add(this.add.text(392, 200, `LP ${stats.maxHp}  MP ${stats.maxMp}  Angriff ${stats.attack}  Verteidigung ${stats.defense}`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
    }));
    this.layer.add(this.add.text(392, 222, `Magie ${stats.magic}  Geist ${stats.spirit}  Tempo ${stats.agility}`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
    }));

    // Namensgebung & Entwicklung (aus dem Talente-Tab hierher verschoben).
    this.button(300, 270, 150, 'Neu benennen', () => {
      const proposed = window.prompt('Neuer Name', summary.member.name);
      if (proposed === null) return;
      const result = renameMember(summary.member, proposed, this.save.progression);
      this.replaceMember(result.member);
      this.save = { ...this.save, progression: result.state };
      this.message = result.message;
      if (result.ok) this.persist();
      this.refresh();
    });
    const availableEvolution = getAvailableEvolutions(summary.member, this.save.progression)[0];
    if (availableEvolution) {
      this.button(464, 270, 150, 'Entwickeln', () => {
        const result = evolveMember(summary.member, this.save.progression, availableEvolution.id);
        this.replaceMember(result.member);
        this.save = { ...this.save, progression: result.state };
        this.message = result.message;
        if (result.ok) this.persist();
        this.refresh();
      }, 0x3b3154);
    }
    // Phase 108 — Skill-Fusion: das erste verschmelzbare Rezept dieses Mitglieds
    // (analog „Entwickeln"). Verbraucht gelernte Skills + Magicules zu einem stärkeren.
    const fusion = getSkillFusionViews(summary.member, this.save.progression, this.save.flags)
      .find((row) => row.fusable);
    if (fusion) {
      this.button(628, 270, 172, `⚗️ ${fusion.outputName} (${fusion.magiculeCost} MG)`, () => {
        const result = fuseMemberSkill(
          summary.member,
          this.save.progression,
          fusion.recipe.id,
          this.save.flags
        );
        this.replaceMember(result.member);
        this.save = { ...this.save, progression: result.state };
        this.message = result.message;
        if (result.ok) this.persist();
        this.refresh();
      }, 0x2f4a52);
    }

    // Skills (linke Spalte).
    this.layer.add(this.add.text(300, 326, 'Skills', { fontFamily: 'sans-serif', fontSize: '14px', color: '#e9c56c' }));
    const skillCol = MENU_LIST_COLUMNS.statusSkills;
    const skills = getProgressionSkills(summary.member, this.save.progression);
    const skillPage = this.menuListPage(skills.length, skillCol);
    skills.slice(skillPage.start, skillPage.start + skillPage.visible).forEach((skill, index) => {
      // Phase 111 — Rang sichtbar machen: Glyphe + Rang-Farbe je Skill-Tier.
      this.layer.add(this.add.text(skillCol.left, skillCol.top + index * skillCol.rowHeight, `${skillTierBadge(skill.tier)}${skill.name} (${skill.costMp} MP): ${skill.description}`, {
        fontFamily: 'sans-serif', fontSize: '11px', color: SKILL_TIER_META[skill.tier].color, wordWrap: { width: 380 }
      }));
    });
    this.drawListPager(skillCol, skillPage);

    // Bindungen (rechte Spalte).
    this.layer.add(this.add.text(710, 326, 'Bindungen', { fontFamily: 'sans-serif', fontSize: '14px', color: '#e9c56c' }));
    const bindCol = MENU_LIST_COLUMNS.statusBindings;
    const relationships = getProgressionRelationships(characterId);
    const bindPage = this.menuListPage(relationships.length, bindCol);
    relationships.slice(bindPage.start, bindPage.start + bindPage.visible).forEach((relationship, index) => {
      const level = getRelationshipLevelNumber(this.save.progression, relationship.id);
      const pointsValue = this.save.progression.relationshipPoints[relationship.id] ?? 0;
      // Phase 98 — Bond-Perk sichtbar machen: die an der erreichten Stufe verankerte
      // Perk wird nur beim Hauptcharakter der Beziehung angezeigt (dort wirkt sie).
      const bondPerk = relationship.characterId === characterId
        ? relationship.levels.find((entry) => entry.perk !== undefined && entry.level <= level)?.perk
        : undefined;
      const perkLine = bondPerk ? `\n★ ${describePerk(bondPerk)}` : '';
      this.layer.add(this.add.text(bindCol.left, bindCol.top + index * bindCol.rowHeight, `${relationship.partnerName} · Stufe ${level}\n${pointsValue} Bindungspunkte${perkLine}`, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', lineSpacing: 3
      }));
    });
    this.drawListPager(bindCol, bindPage);
  }

  private drawGrowth(view: MenuView, characterId: string): void {
    this.sectionTitle('Talentbaum');
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    const tree = getSkillTree(characterId);
    const points = this.save.progression.skillPointsByCharacterId[characterId] ?? 0;
    this.layer.add(this.add.text(300, 152, `${tree?.name ?? 'Skill-Baum'} · ${points} Punkte verfügbar`, {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#e9c56c'
    }));
    if (!tree) return;

    const hasSpecs = tree.nodes.some((node) => node.branch !== undefined);
    if (!hasSpecs) {
      this.drawLegacyGrowth(summary.member, tree.nodes);
      return;
    }

    const unlockedIds = this.save.progression.unlockedSkillNodeIdsByCharacterId[characterId] ?? [];
    const selectedNode = tree.nodes.find((node) => node.id === this.selectedTalentNodeId)
      ?? tree.nodes[0];
    this.selectedTalentNodeId = selectedNode?.id ?? null;
    if (selectedNode) {
      const unlocked = unlockedIds.includes(selectedNode.id);
      const check = canUnlockSkillNode(summary.member, this.save.progression, selectedNode.id, {
        flags: this.save.flags
      });
      const perkText = describeNodePerks(selectedNode.perks).join(' · ');
      const stateText = unlocked ? 'Aktiv' : check.ok ? 'Freischaltbar' : check.message;
      this.layer.add(this.add.text(300, 174, `${selectedNode.name}: ${perkText || selectedNode.description}\n${stateText}`, {
        fontFamily: 'sans-serif', fontSize: '11px', color: unlocked ? '#8dffc2' : check.ok ? '#cdeaff' : '#dca0a0',
        wordWrap: { width: 520 }
      }));
      if (!unlocked) {
        this.button(832, 180, 104, 'Freischalten', () => {
          if (!check.ok) {
            this.message = check.message;
            this.refresh();
            return;
          }
          const committed = committedBranch(unlockedIds);
          if (selectedNode.branch && committed === null
            && !window.confirm(`${branchLabel(tree.nodes, selectedNode.branch)} wählen? Das sperrt die anderen Richtungen.`)) {
            return;
          }
          this.applyProgressionResult(unlockSkillNode(summary.member, this.save.progression, selectedNode.id, {
            flags: this.save.flags
          }));
        }, check.ok ? 0x30506f : 0x2b3140);
      }
    }

    const layoutOptions = {
      left: 300,
      top: 244,
      columnWidth: 212,
      rowHeight: 62,
      nodeWidth: 196,
      nodeHeight: 50,
      viewportWidth: GAME_WIDTH,
      viewportHeight: GAME_HEIGHT
    } as const;
    const layout = layoutSpecTree(tree, layoutOptions);
    this.specTreePanY = clampSpecTreePan(layout, this.specTreePanY, layoutOptions);
    const content = this.add.container(0, this.specTreePanY);
    const maskShape = this.make.graphics({ x: 0, y: 0 }, false)
      .fillStyle(0xffffff)
      .fillRect(294, 214, 642, 306);
    this.specTreeMask = maskShape;
    content.setMask(maskShape.createGeometryMask());
    const panZone = this.add.zone(294, 214, 642, 306).setOrigin(0).setInteractive();
    let dragY: number | null = null;
    const panTo = (value: number): void => {
      this.specTreePanY = clampSpecTreePan(layout, value, layoutOptions);
      content.y = this.specTreePanY;
    };
    panZone.on('wheel', (_pointer: Phaser.Input.Pointer, _dx: number, dy: number) => {
      panTo(this.specTreePanY - Math.sign(dy) * layoutOptions.rowHeight);
    });
    panZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => { dragY = pointer.y; });
    panZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || dragY === null) return;
      panTo(this.specTreePanY + pointer.y - dragY);
      dragY = pointer.y;
    });
    panZone.on('pointerup', () => { dragY = null; });
    panZone.on('pointerout', () => { dragY = null; });
    this.layer.add([panZone, content]);
    const byId = new Map(layout.nodes.map((node) => [node.nodeId, node] as const));
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x5c7196, 0.8);
    for (const edge of layout.edges) {
      const from = byId.get(edge.fromNodeId);
      const to = byId.get(edge.toNodeId);
      if (!from || !to) continue;
      graphics.lineBetween(from.x + 98, from.y + 25, to.x + 98, to.y + 25);
    }
    content.add(graphics);
    layout.columns.forEach((column) => {
      content.add(this.add.text(column.x, 220, branchLabel(tree.nodes, column.branch), {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#e9c56c',
        wordWrap: { width: 196 }, align: 'center'
      }).setFixedSize(196, 20));
    });
    layout.nodes.forEach((position) => {
      const node = tree.nodes.find((candidate) => candidate.id === position.nodeId)!;
      const unlocked = unlockedIds.includes(node.id);
      const check = canUnlockSkillNode(summary.member, this.save.progression, node.id, {
        flags: this.save.flags
      });
      const label = `${unlocked ? 'Aktiv' : check.ok ? `${node.cost} SP` : 'Gesperrt'} · ${node.name}`;
      content.add(addUiTextButton(this, position.x, position.y + layoutOptions.nodeHeight / 2, 196, label, () => {
        this.selectedTalentNodeId = node.id;
        this.refresh();
      }, {
        height: 50,
        fill: unlocked ? 0x1f3a2f : check.ok ? 0x30506f : 0x2b3140,
        fontSize: '11px',
        textOffsetX: 8
      }));
    });
  }

  private drawLegacyGrowth(
    member: MenuGameState['party'][number],
    nodes: readonly SkillTreeNodeDefinition[]
  ): void {
    const nodeCol = MENU_LIST_COLUMNS.growthNodes;
    const nodePage = this.menuListPage(nodes.length, nodeCol);
    nodes.slice(nodePage.start, nodePage.start + nodePage.visible).forEach((node, index) => {
      const unlocked = (
        this.save.progression.unlockedSkillNodeIdsByCharacterId[member.characterId] ?? []
      ).includes(node.id);
      const y = nodeCol.top + index * nodeCol.rowHeight;
      this.button(300, y, 230, `${unlocked ? 'Aktiv' : `${node.cost} SP`} · ${node.name}`, () => {
        const result = unlockSkillNode(member, this.save.progression, node.id, {
          flags: this.save.flags
        });
        this.applyProgressionResult(result);
      }, unlocked ? 0x1f3a2f : 0x1b2940);
      const requirementHint = this.describeSkillRequirement(node);
      this.layer.add(this.add.text(548, y - 12, requirementHint ? `${node.description}\n${requirementHint}` : node.description, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc', wordWrap: { width: 360 }
      }));
    });
    this.drawListPager(nodeCol, nodePage);
  }

  private describeSkillRequirement(node: SkillTreeNodeDefinition): string | null {
    if (node.requiredFlag === 'progression.gobta.wolf-fang-token') {
      return 'Benötigt: Rangas Pakt + Wolfsfang-Abzeichen';
    }
    if (node.requiredFlag === 'story.act1.completed') {
      return 'Benötigt: Bindung der Ahnen abgeschlossen';
    }
    if (node.requiredFlag === 'bond.rigurd.trust-1') {
      return 'Benötigt: Rigurds Vertrauen';
    }
    return node.requiredFlag ? 'Benötigt: Story-Fortschritt' : null;
  }

  private drawQuestLog(view: MenuView): void {
    const allQuests = buildQuestLog(createWorldState(this.save));
    const quests = allQuests.filter((q) => q.status !== 'inactive');

    // Detail-Ansicht ersetzt die Liste komplett (eigener Titel + Zurück-Knopf) —
    // vor dem Listen-Header prüfen, sonst zeichneten beide Titel übereinander.
    const detail = this.selectedQuestId ? quests.find((q) => q.id === this.selectedQuestId) : undefined;
    if (detail) {
      this.drawQuestDetail(detail);
      return;
    }

    const activeCount = allQuests.filter((q) => q.status === 'active').length;
    const doneCount = allQuests.filter((q) => q.status === 'completed').length;
    this.sectionTitle(`Quests & Story — Aktiv ${activeCount} · Abgeschlossen ${doneCount}`);
    // Filter-Tabs auf eigener Zeile UNTER dem Titel: bei y=126 überlappten sie
    // sonst oben die Haupt-Tab-Reihe (y=94) und unten die erste Quest-Karte.
    this.button(24, 170, 120, `Aktiv (${activeCount})`, () => {
      this.questStatus = 'active';
      this.questPage = 0;
      this.selectedQuestId = null;
      this.refresh();
    }, this.questStatus === 'active' ? 0x30506f : 0x1b2940);
    this.button(152, 170, 140, `Erledigt (${doneCount})`, () => {
      this.questStatus = 'completed';
      this.questPage = 0;
      this.selectedQuestId = null;
      this.refresh();
    }, this.questStatus === 'completed' ? 0x30506f : 0x1b2940);

    const filtered = quests.filter((quest) => quest.status === this.questStatus);
    let cursorY = 246;
    if (view.story && this.questStatus === 'active') {
      this.drawStorySummary(view.story, 246);
      cursorY = 350;
    }
    if (filtered.length === 0) {
      const message = this.questStatus === 'active'
        ? 'Keine aktiven Quests. Sprich mit den Bewohnern der Welt.'
        : 'Noch keine Quests abgeschlossen.';
      this.layer.add(this.add.text(42, cursorY - 18, message, {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#9fb2cc'
      }));
      return;
    }

    const pageSize = view.story && this.questStatus === 'active' ? 2 : 3;
    const pageCount = Math.ceil(filtered.length / pageSize);
    this.questPage = Math.min(this.questPage, pageCount - 1);
    const page = filtered.slice(this.questPage * pageSize, (this.questPage + 1) * pageSize);
    page.forEach((quest) => {
      const y = cursorY;
      this.panel(24, y, 900, 92);
      const completed = quest.status === 'completed';
      // Hauptpfad-Quests markieren + farblich abheben (Sortierung stellt sie schon nach
      // oben), damit der rote Faden der Story sichtbar von den Nebenquests absticht.
      const mainTag = quest.main ? '★ HAUPTPFAD · ' : '';
      this.layer.add(this.add.text(42, y - 30, `${mainTag}${quest.title} · ${completed ? 'Abgeschlossen' : 'Aktiv'}`, {
        fontFamily: 'sans-serif', fontSize: '15px',
        color: completed ? '#8dffc2' : (quest.main ? '#8dd0ff' : '#e9c56c')
      }));
      this.layer.add(this.add.text(906, y - 29, `Belohnung: ${quest.rewardGold} Gold`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#e9c56c'
      }).setOrigin(1, 0));
      const currentStep = quest.steps.find((step) => step.current);
      this.layer.add(this.add.text(42, y - 4, currentStep ? `→ ${currentStep.description}` : quest.description, {
        fontFamily: 'sans-serif', fontSize: '12px',
        color: currentStep ? '#e9c56c' : '#9fb2cc', wordWrap: { width: 700 }
      }));
      this.button(800, y + 16, 110, 'Details ›', () => { this.selectedQuestId = quest.id; this.refresh(); });
      cursorY += 106;
    });
    if (pageCount > 1) {
      if (this.questPage > 0) {
        this.button(24, 510, 44, '‹', () => { this.questPage -= 1; this.refresh(); });
      }
      if (this.questPage < pageCount - 1) {
        this.button(76, 510, 44, '›', () => { this.questPage += 1; this.refresh(); });
      }
      this.layer.add(this.add.text(132, 503, `${this.questPage + 1}/${pageCount}`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#9fb2cc'
      }));
    }
  }

  private drawStorySummary(summary: NonNullable<MenuView['story']>, y: number): void {
    this.panel(24, y, 900, 92);
    this.layer.add(this.add.text(42, y - 34, `${summary.banner.kicker} — ${summary.banner.line}`, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#e9c56c'
    }));
    this.layer.add(this.add.text(42, y - 10, summary.recap, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#cbd6e8',
      wordWrap: { width: 520 }
    }));
    this.layer.add(this.add.text(600, y - 30, 'Nächstes Ziel', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#cdeaff'
    }));
    this.layer.add(this.add.text(600, y - 10, summary.nextObjective, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#e9eef7',
      wordWrap: { width: 300 }
    }));
    if (summary.highlights.length > 0) {
      this.layer.add(this.add.text(42, y + 28, `Highlights: ${summary.highlights.slice(0, 3).join(' · ')}`, {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#8dffc2',
        wordWrap: { width: 840 }
      }));
    }
  }

  private drawQuestDetail(quest: QuestLogEntryView): void {
    this.sectionTitle('Quest-Details');
    // y=116 überlappte die Haupt-Tab-Reihe (Zentrum 94, Höhe 44 → bis 116).
    this.button(744, 150, 180, '‹ Zurück zur Liste', () => { this.selectedQuestId = null; this.refresh(); });

    this.layer.add(this.add.text(42, 158, quest.title, { fontFamily: 'sans-serif', fontSize: '20px', color: '#e9c56c' }));
    const statusLabel = quest.status === 'active' ? 'Aktiv' : 'Abgeschlossen';
    const rewardItems = quest.rewardItemIds.length > 0 ? ` · Items: ${quest.rewardItemIds.join(', ')}` : '';
    this.layer.add(this.add.text(42, 188, `Status: ${statusLabel} · Belohnung: ${quest.rewardGold} Gold${rewardItems}`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
    }));
    this.layer.add(this.add.text(42, 212, quest.description, {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#cbd6e8', wordWrap: { width: 880 }
    }));

    this.layer.add(this.add.text(42, 254, 'Schritte', { fontFamily: 'sans-serif', fontSize: '14px', color: '#e9c56c' }));
    quest.steps.forEach((step, index) => {
      const marker = step.completed ? '✓' : step.current ? '◆' : '·';
      const color = step.completed ? '#8dffc2' : step.current ? '#e9c56c' : '#9fb2cc';
      const sy = 282 + index * 42;
      this.layer.add(this.add.text(42, sy, `${marker} ${step.title}`, { fontFamily: 'sans-serif', fontSize: '13px', color }));
      this.layer.add(this.add.text(66, sy + 16, step.description, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc', wordWrap: { width: 840 }
      }));
    });
  }

  private drawCodex(): void {
    this.sectionTitle('Codex');
    // Phase 84/92/93/96/100 — Umschalter: Wissen ↔ Verschlingen ↔ Bewohner ↔
    // Einrichtungen ↔ Kopfgeld ↔ Diplomatie. Kompakt, damit alle sechs in eine Zeile passen.
    this.button(300, 140, 70, `${this.codexMode === 'lore' ? '● ' : ''}Wissen`,
      () => this.setCodexMode('lore'), this.codexMode === 'lore' ? 0x30506f : 0x1b2940);
    this.button(374, 140, 132, `${this.codexMode === 'devour' ? '● ' : ''}🍴 Verschlingen`,
      () => this.setCodexMode('devour'), this.codexMode === 'devour' ? 0x30506f : 0x1b2940);
    this.button(510, 140, 108, `${this.codexMode === 'residents' ? '● ' : ''}🏛️ Bewohner`,
      () => this.setCodexMode('residents'), this.codexMode === 'residents' ? 0x30506f : 0x1b2940);
    this.button(622, 140, 140, `${this.codexMode === 'facilities' ? '● ' : ''}🏭 Einrichtungen`,
      () => this.setCodexMode('facilities'), this.codexMode === 'facilities' ? 0x30506f : 0x1b2940);
    this.button(766, 140, 96, `${this.codexMode === 'bounties' ? '● ' : ''}🎯 Kopfgeld`,
      () => this.setCodexMode('bounties'), this.codexMode === 'bounties' ? 0x30506f : 0x1b2940);
    this.button(866, 140, 90, `${this.codexMode === 'diplomacy' ? '● ' : ''}🤝 Politik`,
      () => this.setCodexMode('diplomacy'), this.codexMode === 'diplomacy' ? 0x30506f : 0x1b2940);
    if (this.codexMode === 'devour') this.drawDevourCompendium();
    else if (this.codexMode === 'residents') this.drawResidentRoster();
    else if (this.codexMode === 'facilities') this.drawFacilities();
    else if (this.codexMode === 'bounties') this.drawBountyBoard();
    else if (this.codexMode === 'diplomacy') this.drawDiplomacy();
    else this.drawLoreEntries();
  }

  private setCodexMode(mode: 'lore' | 'devour' | 'residents' | 'facilities' | 'bounties' | 'diplomacy'): void {
    if (this.codexMode === mode) return;
    this.codexMode = mode;
    this.codexPage = 0;
    this.refresh();
  }

  private drawLoreEntries(): void {
    const all = buildCodexView(createWorldState(this.save));
    // Unentdeckte Einträge ausblenden (Filter) — sie fluteten die Liste mit „Noch nicht
    // entdeckt". Entdeckte werden seitenweise gezeigt, statt über den Rand hinauszulaufen.
    const unlocked = all.filter((entry) => entry.unlocked);
    const lockedCount = all.length - unlocked.length;

    if (unlocked.length === 0) {
      this.layer.add(this.add.text(318, 200, 'Noch keine Codex-Einträge entdeckt — erkunde die Welt.', {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
      }));
    }

    const PER_PAGE = 4;
    const pageCount = Math.max(1, Math.ceil(unlocked.length / PER_PAGE));
    this.codexPage = Math.min(Math.max(0, this.codexPage), pageCount - 1);
    const pageEntries = unlocked.slice(this.codexPage * PER_PAGE, this.codexPage * PER_PAGE + PER_PAGE);

    pageEntries.forEach((entry, index) => {
      const y = 194 + index * 80;
      this.panel(300, y, 590, 62);
      this.layer.add(this.add.text(318, y - 20, `${entry.newlyUnlocked ? '✦ NEU' : '◈'} ${entry.title}`, {
        fontFamily: 'sans-serif', fontSize: '15px',
        color: entry.newlyUnlocked ? '#8dffc2' : '#e9c56c'
      }));
      this.layer.add(this.add.text(318, y + 2, entry.body ?? '', {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', wordWrap: { width: 552 }
      }));
    });

    this.codexFooter(pageCount, lockedCount > 0 ? `${lockedCount} noch unentdeckt` : null);
  }

  private drawDevourCompendium(): void {
    const entries = buildDevourCompendium(createWorldState(this.save));
    const learnedCount = entries.filter((entry) => entry.learned).length;
    const PER_PAGE = 4;
    const pageCount = Math.max(1, Math.ceil(entries.length / PER_PAGE));
    this.codexPage = Math.min(Math.max(0, this.codexPage), pageCount - 1);
    const page = entries.slice(this.codexPage * PER_PAGE, this.codexPage * PER_PAGE + PER_PAGE);

    page.forEach((entry, index) => {
      const y = 194 + index * 80;
      this.panel(300, y, 590, 62);
      this.layer.add(this.add.text(318, y - 20, `${entry.learned ? '✓' : '○'} ${entry.enemyName}  (Lv ${entry.level})`, {
        fontFamily: 'sans-serif', fontSize: '15px', color: entry.learned ? '#8dffc2' : '#e9c56c'
      }));
      this.layer.add(this.add.text(318, y + 2, `🍴 Verschlingen lehrt: ${entry.skillName}`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#cbd6e8'
      }));
    });

    this.codexFooter(pageCount, `${learnedCount}/${entries.length} erbeutet`);
  }

  // Phase 92 — Bewohner-Roster: benannte, in Tempest aufgenommene Gegner-Arten.
  private drawResidentRoster(): void {
    const roster = buildResidentRoster(
      this.save.progression.residentIds,
      this.save.progression.promotedResidentIds,
      this.save.progression.awakenedResidentIds
    );
    const awakening = canAwakenTempest(this.save.progression, this.save.flags);
    const roleSummary = (['Wache', 'Späher', 'Handwerk', 'Heilung', 'Bau'] as const)
      .filter((role) => roster.countsByRole[role] > 0)
      .map((role) => `${role} ${roster.countsByRole[role]}`)
      .join('   ');
    this.layer.add(this.add.text(318, 172, roleSummary || 'Noch keine Bewohner benannt.', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#9fb2cc'
    }));
    this.button(672, 172, 216, `Erntefest · ${AWAKENING_MAGICULE_COST}`, () =>
      this.awakenTempest(), awakening.ok ? 0x3b3154 : 0x242b38);

    const PER_PAGE = 4;
    const pageCount = Math.max(1, Math.ceil(roster.entries.length / PER_PAGE));
    this.codexPage = Math.min(Math.max(0, this.codexPage), pageCount - 1);
    const page = roster.entries.slice(this.codexPage * PER_PAGE, this.codexPage * PER_PAGE + PER_PAGE);

    page.forEach((entry, index) => {
      const y = 206 + index * 78;
      this.panel(300, y, 590, 60);
      const heading = entry.recruited
        ? `${entry.awakened ? '✦' : entry.promoted ? '★' : '✓'} ${entry.resident.name} — ${entry.resident.species}  · ${entry.resident.role}`
        : `○ Unbenannt — ${entry.resident.species}`;
      this.layer.add(this.add.text(318, y - 19, heading, {
        fontFamily: 'sans-serif', fontSize: '15px', color: entry.recruited ? '#8dffc2' : '#6f83a5'
      }));
      const body = entry.recruited
        ? entry.resident.origin
        : `Verschlinge einen ${entry.originEnemyName}, um ihn zu benennen.`;
      this.layer.add(this.add.text(318, y + 2, body, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', wordWrap: { width: 552 }
      }));
      if (entry.recruited && !entry.promoted) {
        this.button(748, y + 13, 126, `Offizier · ${RESIDENT_PROMOTION_MAGICULE_COST}`, () =>
          this.promoteResident(entry.resident.id), this.save.progression.magicules >= RESIDENT_PROMOTION_MAGICULE_COST
            ? 0x2f6f55
            : 0x242b38
        );
      }
    });

    this.codexFooter(pageCount, `${roster.recruitedCount}/${roster.totalCount} Bewohner`);
  }

  private promoteResident(residentId: string): void {
    const result = promoteResidentRule(
      this.save.progression.residentIds,
      this.save.progression.promotedResidentIds,
      this.save.progression.magicules,
      residentId
    );
    this.message = result.message;
    if (result.ok) {
      this.save = {
        ...this.save,
        progression: {
          ...this.save.progression,
          promotedResidentIds: result.promotedResidentIds,
          magicules: result.magicules
        }
      };
      this.persist();
    }
    this.refresh();
  }

  private awakenTempest(): void {
    const result = awakenTempest(this.save.progression, this.save.flags);
    this.message = result.message;
    if (result.ok) {
      this.save = {
        ...this.save,
        flags: { ...this.save.flags, [AWAKENING_SCENE_FLAG]: true },
        progression: result.state
      };
      this.persist();
    }
    this.refresh();
  }

  // Phase 93 — Einrichtungen: nach Rolle besetzte Werke, ihre erwartete Ausbeute pro
  // Rast und die „Tempest-Rast halten"-Aktion, die einen Produktions-Zyklus abrechnet.
  private drawFacilities(): void {
    const overview = buildFacilityOverview(
      this.save.progression.residentIds,
      this.save.flags,
      this.save.progression.promotedResidentIds,
      this.save.progression.awakenedResidentIds
    );
    const cycles = this.save.progression.productionCycles;
    const stageLabel = tempestGrowthLabel(overview.stage);
    const summary = overview.level > 0
      ? `${stageLabel} · Ausbaustufe ${overview.level} · ${cycles} Produktionszyklen`
      : `${stageLabel} · noch keine Einrichtungen — gründe zuerst Tempest`;
    this.layer.add(this.add.text(318, 172, summary, {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#9fb2cc'
    }));

    overview.facilities.forEach((view, index) => {
      const y = 204 + index * 60;
      this.panel(300, y, 590, 56);
      const heading = view.unlocked
        ? `${view.facility.name} — ${view.outputLabel} +${view.amountPerCycle}/Rast`
        : `${view.facility.name} (verschlossen)`;
      this.layer.add(this.add.text(318, y - 18, heading, {
        fontFamily: 'sans-serif', fontSize: '15px',
        color: view.amountPerCycle > 0 ? '#8dffc2' : '#6f83a5'
      }));
      const staffText = view.staff.length > 0 ? view.staff.join(', ') : 'unbesetzt';
      this.layer.add(this.add.text(318, y + 4, `${view.facility.description}  ·  ${staffText}`, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', wordWrap: { width: 552 }
      }));
    });

    const research = buildResearchView(this.researchContext())[0];
    this.panel(300, 446, 590, 44);
    if (research) {
      const inputs = research.inputs
        .map((input) => `${input.name} ${input.owned}/${input.required}`)
        .join(' · ');
      this.layer.add(this.add.text(318, 432, `Forschung: ${research.project.name}`, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: research.completable ? '#e9eef7' : '#7d8aa0'
      }));
      this.layer.add(this.add.text(318, 452, `${inputs} · ${research.project.magiculeCost} Magicules`, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: research.affordable ? '#9fb2cc' : '#c98a8a'
      }));
      this.button(748, 448, 126, research.completable ? 'Forschen' : 'Fehlt',
        () => this.completeResearch(research.project.id),
        research.completable ? 0x2f6f55 : 0x242b38);
    } else {
      this.layer.add(this.add.text(318, 442, 'Forschung: keine offenen Projekte.', {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#6f83a5'
      }));
    }

    const canProduce = overview.totalPerCycle > 0;
    this.button(300, 508, 300, canProduce ? '🏕️ Tempest-Rast halten' : 'Rast (nichts zu produzieren)',
      () => this.produceOneCycle(), canProduce ? 0x2f6f55 : 0x242b38);
    this.layer.add(this.add.text(888, 520, `≈ ${overview.totalPerCycle} Ausbeute/Rast`, {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#6f83a5'
    }).setOrigin(1, 0));
  }

  // Phase 100 — Diplomatie: Reputationsstände je Faktion, Rang, Fortschritt zur
  // nächsten Stufe und der Freischalt-Status jeder Schwelle. Reine Anzeige.
  private drawDiplomacy(): void {
    const standings = buildDiplomacyView(this.save.progression.factionReputationByFactionId);
    this.layer.add(this.add.text(318, 172, 'Tempests Ruf bei den Mächten der Region — bewegt durch Entscheidungen und Bündnisse.', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#9fb2cc', wordWrap: { width: 600 }
    }));

    standings.forEach((standing, index) => {
      const y = 210 + index * 74;
      this.panel(300, y, 590, 68);
      this.layer.add(this.add.text(318, y - 24, `${standing.faction.name} — ${standing.rankTitle} (${standing.points}/${MAX_REPUTATION})`, {
        fontFamily: 'sans-serif', fontSize: '15px',
        color: standing.points > 0 ? '#8dffc2' : '#6f83a5'
      }));
      const tiers = standing.thresholds
        .map((threshold) => `${threshold.reached ? '✓' : '○'} ${threshold.title} (${threshold.points})`)
        .join('   ');
      this.layer.add(this.add.text(318, y - 2, tiers, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8'
      }));
      const footer = standing.nextThreshold
        ? `Nächste Stufe „${standing.nextThreshold.title}" in ${standing.pointsToNext} Punkten — schaltet frei: ${standing.nextThreshold.reward}`
        : `Höchste Stufe erreicht — ${standing.faction.description}`;
      this.layer.add(this.add.text(318, y + 18, footer, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc', wordWrap: { width: 552 }
      }));
    });
  }

  private produceOneCycle(): void {
    const result = runProductionCycle({
      residentIds: this.save.progression.residentIds,
      promotedResidentIds: this.save.progression.promotedResidentIds,
      awakenedResidentIds: this.save.progression.awakenedResidentIds,
      flags: this.save.flags,
      inventory: this.state.inventory,
      gold: this.state.gold
    });
    this.message = result.message;
    if (result.ok) {
      this.state = { ...this.state, inventory: result.inventory, gold: result.gold };
      this.save = {
        ...this.save,
        progression: {
          ...this.save.progression,
          productionCycles: this.save.progression.productionCycles + 1
        }
      };
      this.persist();
    }
    this.refresh();
  }

  private bountyContext(): BountyContext {
    return {
      defeatedEnemyCounts: this.save.progression.defeatedEnemyCountsByEnemyId,
      claimedBountyCounts: this.save.progression.claimedBountyCountsByBountyId,
      inventory: this.state.inventory,
      gold: this.state.gold,
      flags: this.state.flags ?? this.save.flags
    };
  }

  // Phase 96 — Kopfgeldbrett: freigeschaltete Subjugations-Auftraege mit Fortschritt
  // (erlegte Ziele/erforderlich) + Belohnung und die „Einlösen"-Aktion, sobald das
  // Ziel oft genug erlegt wurde.
  private drawBountyBoard(): void {
    const board = buildBountyBoardView(this.bountyContext());
    if (board.length === 0) {
      this.layer.add(this.add.text(318, 200, 'Noch keine Auftraege — registriere dich bei der Gilde in Blumund.', {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
      }));
      this.codexFooter(1, null);
      return;
    }

    const claimableCount = board.filter((view) => view.claimable).length;
    const PER_PAGE = 4;
    const pageCount = Math.max(1, Math.ceil(board.length / PER_PAGE));
    this.codexPage = Math.min(Math.max(0, this.codexPage), pageCount - 1);
    const page = board.slice(this.codexPage * PER_PAGE, this.codexPage * PER_PAGE + PER_PAGE);

    page.forEach((view, index) => {
      const y = 194 + index * 80;
      this.panel(300, y, 590, 62);
      this.layer.add(this.add.text(318, y - 20, `${view.claimable ? '✦' : '◎'} ${view.bounty.name}  (${view.progress}/${view.required})`, {
        fontFamily: 'sans-serif', fontSize: '15px', color: view.claimable ? '#8dffc2' : '#e9c56c'
      }));
      const rewardText = [
        view.rewardGold > 0 ? `${view.rewardGold} Gold` : null,
        ...view.rewardItems.map((reward) => `${reward.label} +${reward.amount}`)
      ].filter((entry): entry is string => entry !== null).join(', ');
      this.layer.add(this.add.text(318, y + 2, `Ziel: ${view.targetName} · Lohn: ${rewardText}`, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', wordWrap: { width: 430 }
      }));
      if (view.claimable) {
        this.button(748, y + 13, 126, 'Einlösen', () => this.claimBountyReward(view.bounty.id), 0x2f6f55);
      }
    });

    this.codexFooter(pageCount, `${claimableCount} einlösbar`);
  }

  private claimBountyReward(bountyId: string): void {
    const bounty = getBounty(bountyId);
    if (!bounty) {
      this.message = 'Auftrag nicht verfügbar.';
      this.refresh();
      return;
    }
    const result = claimBounty(bounty, this.bountyContext());
    this.message = result.message;
    if (result.ok) {
      this.state = { ...this.state, inventory: result.inventory, gold: result.gold };
      this.save = {
        ...this.save,
        progression: {
          ...this.save.progression,
          claimedBountyCountsByBountyId: result.claimedBountyCounts
        }
      };
      this.persist();
    }
    this.refresh();
  }

  private completeResearch(projectId: string): void {
    const project = buildResearchView(this.researchContext())
      .find((entry) => entry.project.id === projectId)?.project;
    if (!project) {
      this.message = 'Forschung nicht verfügbar.';
      this.refresh();
      return;
    }
    const result = completeResearchProject(project, this.researchContext());
    this.message = result.message;
    if (result.ok) {
      this.state = { ...this.state, inventory: result.inventory, flags: result.flags };
      this.save = {
        ...this.save,
        flags: result.flags,
        progression: {
          ...this.save.progression,
          magicules: result.magicules
        }
      };
      this.persist();
    }
    this.refresh();
  }

  private codexFooter(pageCount: number, rightNote: string | null): void {
    const footerY = 512;
    if (pageCount > 1) {
      this.button(300, footerY, 96, '‹ Zurück', () => { this.codexPage -= 1; this.refresh(); });
      this.button(404, footerY, 96, 'Weiter ›', () => { this.codexPage += 1; this.refresh(); });
      this.layer.add(this.add.text(516, footerY + 12, `Seite ${this.codexPage + 1}/${pageCount}`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#9fb2cc'
      }));
    }
    if (rightNote) {
      this.layer.add(this.add.text(888, footerY + 12, rightNote, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#6f83a5'
      }).setOrigin(1, 0));
    }
  }

  private drawRangaTravel(): void {
    const view = buildRangaTravelView(createWorldState(this.save), this.save.location);
    this.sectionTitle('Ranga-Scout & Schnellreise');

    // Center 170 → 198 (Oberkante 124 ragte in Titel); Texte mit. Eng gehalten,
    // damit Panel + Listenkopf + 6 Reiseziele ohne Blättern unter den Titel passen.
    this.panel(300, 198, 590, 92);
    this.drawPortrait('ranga', 348, 198, 56);
    this.layer.add(this.add.text(392, 160, view.scout.title, {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: view.enabled ? '#e9c56c' : '#6f83a5'
    }));
    this.layer.add(this.add.text(392, 184, view.scout.body, {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#cbd6e8',
      wordWrap: { width: 470 }
    }));
    if (view.scout.warning) {
      this.layer.add(this.add.text(392, 234, `⚠ ${view.scout.warning}`, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#ffd6de',
        wordWrap: { width: 470 }
      }));
    }

    this.layer.add(this.add.text(300, 250, 'Entdeckte sichere Reisepunkte', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#cdeaff'
    }));
    const destCol = MENU_LIST_COLUMNS.travelPoints;
    const destPage = this.menuListPage(view.destinations.length, destCol);
    view.destinations.slice(destPage.start, destPage.start + destPage.visible).forEach((destination, index) => {
      const y = destCol.top + index * destCol.rowHeight;
      const label = `${destination.name} · ${destination.dangerLabel}`;
      const clickable = destination.status === 'available';
      this.button(300, y, 238, label, () => {
        if (!clickable) {
          this.message = destination.reason;
          this.refresh();
          return;
        }
        this.fastTravelWithRanga(destination.id);
      }, travelStatusColor(destination.status));
      this.layer.add(this.add.text(552, y - 13, destination.reason, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: clickable ? '#8dffc2' : '#9fb2cc',
        wordWrap: { width: 330 }
      }));
    });
    this.drawListPager(destCol, destPage);
  }

  private applyResult(result: { ok: boolean; state: MenuGameState; message: string }): void {
    this.state = result.state;
    this.message = result.message;
    if (result.ok) {
      this.save = {
        ...this.save,
        party: {
          ...this.save.party,
          active: this.state.party,
          reserve: this.state.reserve ?? [],
          gold: this.state.gold
        },
        inventory: {
          stacks: this.state.inventory
        }
      };
      this.persist();
    }
    this.refresh();
  }

  private applyProgressionResult(result: ProgressionActionResult): void {
    this.message = result.message;
    if (result.ok) {
      this.save = { ...this.save, progression: result.state };
      this.persist();
    }
    this.refresh();
  }

  private replaceMember(member: MenuGameState['party'][number]): void {
    this.state = {
      ...this.state,
      party: this.state.party.map((candidate) =>
        candidate.characterId === member.characterId ? member : candidate
      )
    };
    this.save = {
      ...this.save,
      party: {
        ...this.save.party,
        active: this.state.party,
        reserve: this.state.reserve ?? []
      }
    };
  }

  private persist(): void {
    this.save = autoSave(window.localStorage, {
      ...this.save,
      party: {
        ...this.save.party,
        active: this.state.party,
        reserve: this.state.reserve ?? [],
        gold: this.state.gold
      },
      inventory: {
        stacks: this.state.inventory
      }
    });
  }

  private fastTravelWithRanga(destinationId: string): void {
    const world = createWorldState(this.save);
    const result = resolveRangaTravel(world, this.save.location, destinationId);
    this.message = result.message;
    if (!canPresentRangaJourney(result)) {
      this.refresh();
      return;
    }
    this.scene.stop('Overworld');
    this.scene.stop();
    this.scene.start('RangaJourney', {
      destinationId: result.destinationId,
      destinationName: result.destinationName,
      location: result.location
    });
  }

  private close(): void {
    this.scene.resume('Overworld');
    this.scene.stop();
  }

  // Phase 119: Menu keyboard support (cycle for party + quests tabs, activate)
  private moveMenuSelection(delta: number): void {
    if (this.selectedTab === 'party') {
      const n = (this as any).view?.members?.length || 4;
      this.selectedMemberIndex = (this.selectedMemberIndex + delta + n) % n;
    } else if (this.selectedTab === 'quests') {
      // cycle quests
      this.selectedQuestId = this.selectedQuestId ? null : 'dummy';
    }
    this.refresh();
  }

  private activateMenuSelection(): void {
    if (this.selectedTab === 'party') {
      // activate member
      this.refresh();
    } else {
      this.selectedQuestId = this.selectedQuestId || 'activated';
    }
    this.refresh();
  }

  private sectionTitle(label: string): void {
    this.layer.add(this.add.text(300, 124, label, {
      fontFamily: 'sans-serif',
      fontSize: '19px',
      color: '#e9c56c'
    }));
  }

  private menuListPage(total: number, column: MenuListColumn): MenuListPage {
    const page = paginateMenuList(total, column, this.listPages[column.id] ?? 0);
    this.listPages[column.id] = page.page;
    return page;
  }

  private drawListPager(column: MenuListColumn, page: MenuListPage): void {
    if (page.pageCount <= 1) return;
    const y = MENU_LIST_BOTTOM - MENU_PAGER_HEIGHT / 2;
    if (page.page > 0) {
      this.button(column.left, y, 44, '‹', () => {
        this.listPages[column.id] = page.page - 1;
        this.refresh();
      });
    }
    if (page.page < page.pageCount - 1) {
      this.button(column.left + 52, y, 44, '›', () => {
        this.listPages[column.id] = page.page + 1;
        this.refresh();
      });
    }
    this.layer.add(this.add.text(column.left + 108, y - 7, `${page.page + 1}/${page.pageCount}`, {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#6f83a5'
    }));
  }

  private panel(x: number, y: number, width: number, height: number): void {
    this.layer.add(addUiPanel(this, x, y, width, height, { originY: 0.5 }));
  }

  private button(
    x: number,
    y: number,
    width: number,
    label: string,
    callback: () => void,
    color = 0x1b2940
  ): void {
    this.layer.add(addUiTextButton(this, x, y, width, label, callback, {
      height: MENU_TOUCH_TARGET_PX,
      fill: color,
      idleAlpha: 0.96,
      fontSize: '13px',
      textOffsetX: 10
    }));
  }

  private drawPortrait(characterId: string, x: number, y: number, size: number): void {
    const key = portraitKeyForCharacter(characterId);
    if (!key || !this.textures.exists(key)) {
      return;
    }
    this.layer.add(addUiPortraitFrame(this, x, y, size));
    this.layer.add(this.add.image(x, y, key).setDisplaySize(size, size));
  }
}

function slotLabel(slot: EquipmentSlot): string {
  if (slot === 'weapon') return 'Waffe';
  if (slot === 'armor') return 'Rüstung';
  return 'Accessoire';
}

function travelStatusColor(status: RangaTravelStatus): number {
  if (status === 'available') return 0x1f3a2f;
  if (status === 'current') return 0x30506f;
  if (status === 'unknown') return 0x2b3140;
  if (status === 'unsafe') return 0x4a2f34;
  return 0x242b38;
}

function portraitKeyForCharacter(characterId: string): string | null {
  if (isPortraitKind(characterId)) {
    return portraitKey(characterId);
  }
  return null;
}

function isPortraitKind(value: string): value is PortraitKind {
  return PORTRAIT_KINDS.includes(value as PortraitKind);
}

function branchLabel(nodes: readonly SkillTreeNodeDefinition[], branch: string): string {
  const description = nodes.find((node) => node.branch === branch)?.description ?? branch;
  return /^Strang ([^:]+):/.exec(description)?.[1] ?? branch;
}
