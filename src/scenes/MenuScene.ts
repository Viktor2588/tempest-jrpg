import Phaser from 'phaser';
import type { EquipmentSlot, SkillTreeNodeDefinition } from '../data';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
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
  enchantEquipment,
  evolveMember,
  getActiveEquipmentSetTiers,
  getActiveEvolution,
  getAvailableEvolutions,
  getEnchantmentLevel,
  getProgressionRelationships,
  getProgressionSkills,
  getRelationshipLevelNumber,
  getSkillTree,
  renameMember,
  unlockSkillNode,
  type ProgressionActionResult
} from '../systems/progression';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { buildCodexView, buildQuestLog, createWorldState, type QuestLogEntryView } from '../systems/world';
import { addUiPanel, addUiPortraitFrame, addUiTextButton } from '../render/uiSkin';
import { portraitKey } from '../render/portraitAtlas';
import { PORTRAIT_KINDS, type PortraitKind } from '../render/artSpec';

type MenuTab = 'party' | 'inventory' | 'equipment' | 'status' | 'growth' | 'quests' | 'codex' | 'travel';

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
// als Auswahl-Seitenleiste gebraucht. Quests/Codex/Reise nutzen die volle Breite.
const CHARACTER_TABS: ReadonlySet<MenuTab> = new Set<MenuTab>(['party', 'inventory', 'equipment', 'status', 'growth']);

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
  private selectedQuestId: string | null = null;
  private layer!: Phaser.GameObjects.Container;
  private message = TAB_DESCRIPTIONS.party;

  constructor() {
    super('Menu');
  }

  create(): void {
    this.save = loadSave(window.localStorage) ?? createNewSave();
    this.state = {
      party: this.save.party.active,
      reserve: this.save.party.reserve,
      inventory: this.save.inventory.stacks,
      gold: this.save.party.gold,
      flags: this.save.flags,
      quests: this.save.quests
    };

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.93);
    this.layer = this.add.container(0, 0);
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-M', () => this.close());
    this.refresh();
  }

  private refresh(): void {
    this.layer.removeAll(true);
    const view = buildMenuView(this.state);
    const selected = view.members[this.selectedMemberIndex] ?? view.members[0];

    this.layer.add(this.add.text(24, 18, 'Tempest-Menü', {
      fontFamily: 'serif',
      fontSize: '30px',
      color: '#e9c56c'
    }));
    this.layer.add(this.add.text(24, 52, `${view.gold} Gold · ${this.message}`, {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#9fb2cc'
    }));
    this.button(GAME_WIDTH - 126, 34, 104, 'Schließen', () => this.close(), 0x3a2230);

    TABS.forEach((tab, index) => {
      this.button(24 + index * 112, 94, 104, tab.label, () => {
        this.selectedTab = tab.id;
        // Beim Tabwechsel die Kurzbeschreibung in die Meldungszeile setzen, damit klar
        // ist, was der Menüpunkt macht; Aktions-Feedback überschreibt sie danach.
        this.message = TAB_DESCRIPTIONS[tab.id];
        this.codexPage = 0;
        this.selectedQuestId = null;
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
    this.sectionTitle('Party-Übersicht');
    this.layer.add(this.add.text(300, 136, 'Aktive Gruppe · maximal 3', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#cdeaff'
    }));
    view.members.forEach((summary, index) => {
      const y = 176 + index * 96;
      const stats = calculateProgressionStats(
        summary.member,
        this.save.progression
      );
      const formName = getActiveEvolution(
        this.save.progression,
        summary.member.characterId
      )?.formName ?? summary.character.species;
      this.panel(300, y, 370, 82);
      this.drawPortrait(summary.member.characterId, 336, y, 46);
      this.layer.add(this.add.text(372, y - 31, `${summary.member.name} · ${formName}`, {
        fontFamily: 'sans-serif',
        fontSize: '15px', color: index === this.selectedMemberIndex ? '#e9c56c' : '#e9eef7'
      }));
      this.layer.add(this.add.text(372, y - 8, summary.character.role, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc'
      }));
      this.layer.add(this.add.text(372, y + 12, `LP ${summary.member.currentHp}/${stats.maxHp} · MP ${summary.member.currentMp}/${stats.maxMp}`, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#9fb2cc'
      }));
    });

    this.layer.add(this.add.text(690, 136, 'Reserve', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#cdeaff'
    }));
    if (view.reserveMembers.length === 0) {
      this.layer.add(this.add.text(690, 166, 'Noch keine Reserve.', {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#6f83a5'
      }));
    }
    view.reserveMembers.slice(0, 6).forEach((summary, index) => {
      const y = 182 + index * 54;
      this.button(690, y, 190, `${summary.member.name} · Lv.${summary.member.level}`, () => {
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
      this.layer.add(this.add.text(690, 500, 'Bei voller Gruppe ersetzt der Klick\ndas links ausgewählte Mitglied.', {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc'
      }));
    }
  }

  private drawInventory(view: MenuView, characterId: string): void {
    this.sectionTitle('Inventar · antippen zum Nutzen');
    this.button(760, 126, 120, 'Sortiert', () => {
      this.message = 'Inventar ist automatisch sortiert.';
      this.refresh();
    });

    view.inventory.forEach((entry, index) => {
      const y = 160 + index * 48;
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
  }

  private drawEquipment(view: MenuView, characterId: string): void {
    this.sectionTitle('Ausrüstung');
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    EQUIPMENT_SLOTS.forEach((slot, index) => {
      const item = summary.equipmentItems[slot];
      const enchantmentLevel = getEnchantmentLevel(summary.member, this.save.progression, slot);
      const y = 150 + index * 100;
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
      430,
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
    view.inventory
      .filter((entry) => entry.equipSlot)
      .forEach((entry, index) => {
        this.button(620, 160 + index * 48, 260, `${entry.item.name} ×${entry.quantity}`, () => {
          this.applyResult(equipItem(this.state, characterId, entry.item.id));
        });
      });
  }

  private drawStatus(view: MenuView, characterId: string): void {
    this.sectionTitle('Status, Entwicklung & Bindungen');
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    const stats = calculateProgressionStats(summary.member, this.save.progression);
    const formName = getActiveEvolution(this.save.progression, characterId)?.formName
      ?? summary.character.species;

    // Werte-Panel.
    this.panel(300, 158, 570, 92);
    this.drawPortrait(characterId, 348, 162, 58);
    this.layer.add(this.add.text(392, 126, `${summary.member.name} · ${formName} · ${summary.character.role}`, {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#e9eef7'
    }));
    this.layer.add(this.add.text(392, 154, `LP ${stats.maxHp}  MP ${stats.maxMp}  Angriff ${stats.attack}  Verteidigung ${stats.defense}`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
    }));
    this.layer.add(this.add.text(392, 176, `Magie ${stats.magic}  Geist ${stats.spirit}  Tempo ${stats.agility}`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
    }));

    // Namensgebung & Entwicklung (aus dem Talente-Tab hierher verschoben).
    this.button(300, 224, 150, 'Neu benennen', () => {
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
      this.button(464, 224, 150, 'Entwickeln', () => {
        const result = evolveMember(summary.member, this.save.progression, availableEvolution.id);
        this.replaceMember(result.member);
        this.save = { ...this.save, progression: result.state };
        this.message = result.message;
        if (result.ok) this.persist();
        this.refresh();
      }, 0x3b3154);
    }

    // Skills (linke Spalte).
    this.layer.add(this.add.text(300, 280, 'Skills', { fontFamily: 'sans-serif', fontSize: '14px', color: '#e9c56c' }));
    getProgressionSkills(summary.member, this.save.progression).forEach((skill, index) => {
      this.layer.add(this.add.text(300, 306 + index * 32, `${skill.name} (${skill.costMp} MP): ${skill.description}`, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', wordWrap: { width: 380 }
      }));
    });

    // Bindungen (rechte Spalte).
    this.layer.add(this.add.text(710, 280, 'Bindungen', { fontFamily: 'sans-serif', fontSize: '14px', color: '#e9c56c' }));
    getProgressionRelationships(characterId).forEach((relationship, index) => {
      const level = getRelationshipLevelNumber(this.save.progression, relationship.id);
      const pointsValue = this.save.progression.relationshipPoints[relationship.id] ?? 0;
      this.layer.add(this.add.text(710, 306 + index * 50, `${relationship.partnerName} · Stufe ${level}\n${pointsValue} Bindungspunkte`, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', lineSpacing: 3
      }));
    });
  }

  private drawGrowth(view: MenuView, characterId: string): void {
    this.sectionTitle('Talentbaum');
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    const tree = getSkillTree(characterId);
    const points = this.save.progression.skillPointsByCharacterId[characterId] ?? 0;
    this.layer.add(this.add.text(300, 158, `${tree?.name ?? 'Skill-Baum'} · ${points} Punkte verfügbar`, {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#e9c56c'
    }));
    tree?.nodes.forEach((node, index) => {
      const unlocked = (
        this.save.progression.unlockedSkillNodeIdsByCharacterId[characterId] ?? []
      ).includes(node.id);
      const y = 198 + index * 62;
      this.button(300, y, 230, `${unlocked ? 'Aktiv' : `${node.cost} SP`} · ${node.name}`, () => {
        const result = unlockSkillNode(summary.member, this.save.progression, node.id, {
          flags: this.save.flags
        });
        this.applyProgressionResult(result);
      }, unlocked ? 0x1f3a2f : 0x1b2940);
      const requirementHint = this.describeSkillRequirement(node);
      this.layer.add(this.add.text(548, y - 14, requirementHint ? `${node.description}\n${requirementHint}` : node.description, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc', wordWrap: { width: 360 }
      }));
    });
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
    const activeCount = allQuests.filter((q) => q.status === 'active').length;
    const doneCount = allQuests.filter((q) => q.status === 'completed').length;
    this.sectionTitle(`Quests & Story — Aktiv ${activeCount} · Abgeschlossen ${doneCount}`);
    // Unentdeckte/noch nicht angenommene Quests ausblenden: sie würden das Log fluten
    // und Inhalte spoilern. buildQuestLog liefert aktive zuerst, dann abgeschlossene.
    const quests = allQuests.filter((q) => q.status !== 'inactive');
    // Detailansicht einer angetippten Quest (Übersicht bleibt Zusammenfassung).
    const detail = this.selectedQuestId ? quests.find((q) => q.id === this.selectedQuestId) : undefined;
    if (detail) {
      this.drawQuestDetail(detail);
      return;
    }

    let cursorY = 192;
    if (view.story) {
      this.drawStorySummary(view.story, 180);
      cursorY = 296;
    }
    if (quests.length === 0) {
      this.layer.add(this.add.text(42, cursorY - 18, 'Noch keine Quests angenommen. Sprich mit den Bewohnern der Welt.', {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#9fb2cc'
      }));
      return;
    }
    // Übersicht: aktive Quests als Zusammenfassung (Titel + aktueller Schritt + „Details").
    const activeLimit = view.story ? 2 : 3;
    const allActive = quests.filter((q) => q.status === 'active');
    const active = allActive.slice(0, activeLimit);
    const completed = quests.filter((q) => q.status === 'completed');
    active.forEach((quest) => {
      const y = cursorY;
      this.panel(24, y, 900, 92);
      this.layer.add(this.add.text(42, y - 30, `${quest.title} · Aktiv`, {
        fontFamily: 'sans-serif', fontSize: '15px', color: '#e9c56c'
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
    const hiddenActive = allActive.length - active.length;
    if (hiddenActive > 0) {
      this.layer.add(this.add.text(42, cursorY - 30, `… +${hiddenActive} weitere aktive Quest im Log`, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#6f83a5'
      }));
      cursorY += 24;
    }
    // Abgeschlossene Quests kompakt einzeilig als Archiv, soweit Platz bleibt.
    if (completed.length > 0) {
      if (active.length === 0) cursorY = view.story ? 300 : 196;
      this.layer.add(this.add.text(42, cursorY - 30, 'Abgeschlossen', {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#8dffc2'
      }));
      let lineY = cursorY - 6;
      const maxLines = Math.max(0, Math.floor((524 - lineY) / 22));
      completed.slice(0, maxLines).forEach((quest) => {
        this.layer.add(this.add.text(42, lineY, `✓ ${quest.title}`, {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#6f9a86'
        }));
        lineY += 22;
      });
      const hidden = completed.length - Math.min(maxLines, completed.length);
      if (hidden > 0) {
        this.layer.add(this.add.text(42, lineY, `… +${hidden} weitere abgeschlossen`, {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#6f83a5'
        }));
      }
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
    this.button(744, 116, 180, '‹ Zurück zur Liste', () => { this.selectedQuestId = null; this.refresh(); });

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
    const all = buildCodexView(createWorldState(this.save));
    // Unentdeckte Einträge ausblenden (Filter) — sie fluteten die Liste mit „Noch nicht
    // entdeckt". Entdeckte werden seitenweise gezeigt, statt über den Rand hinauszulaufen.
    const unlocked = all.filter((entry) => entry.unlocked);
    const lockedCount = all.length - unlocked.length;

    if (unlocked.length === 0) {
      this.layer.add(this.add.text(318, 172, 'Noch keine Codex-Einträge entdeckt — erkunde die Welt.', {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
      }));
    }

    const PER_PAGE = 4;
    const pageCount = Math.max(1, Math.ceil(unlocked.length / PER_PAGE));
    this.codexPage = Math.min(Math.max(0, this.codexPage), pageCount - 1);
    const pageEntries = unlocked.slice(this.codexPage * PER_PAGE, this.codexPage * PER_PAGE + PER_PAGE);

    pageEntries.forEach((entry, index) => {
      const y = 170 + index * 84;
      this.panel(300, y, 590, 66);
      this.layer.add(this.add.text(318, y - 22, `${entry.newlyUnlocked ? '✦ NEU' : '◈'} ${entry.title}`, {
        fontFamily: 'sans-serif', fontSize: '15px',
        color: entry.newlyUnlocked ? '#8dffc2' : '#e9c56c'
      }));
      this.layer.add(this.add.text(318, y, entry.body ?? '', {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#cbd6e8', wordWrap: { width: 552 }
      }));
    });

    // Fußzeile: Seitenblättern + Filterhinweis auf unentdeckte Einträge.
    const footerY = 512;
    if (pageCount > 1) {
      this.button(300, footerY, 96, '‹ Zurück', () => { this.codexPage -= 1; this.refresh(); });
      this.button(404, footerY, 96, 'Weiter ›', () => { this.codexPage += 1; this.refresh(); });
      this.layer.add(this.add.text(516, footerY + 12, `Seite ${this.codexPage + 1}/${pageCount}`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#9fb2cc'
      }));
    }
    if (lockedCount > 0) {
      this.layer.add(this.add.text(888, footerY + 12, `${lockedCount} noch unentdeckt`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#6f83a5'
      }).setOrigin(1, 0));
    }
  }

  private drawRangaTravel(): void {
    const view = buildRangaTravelView(createWorldState(this.save), this.save.location);
    this.sectionTitle('Ranga-Scout & Schnellreise');

    this.panel(300, 170, 590, 92);
    this.drawPortrait('ranga', 348, 170, 56);
    this.layer.add(this.add.text(392, 132, view.scout.title, {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: view.enabled ? '#e9c56c' : '#6f83a5'
    }));
    this.layer.add(this.add.text(392, 156, view.scout.body, {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#cbd6e8',
      wordWrap: { width: 470 }
    }));
    if (view.scout.warning) {
      this.layer.add(this.add.text(392, 206, `⚠ ${view.scout.warning}`, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#ffd6de',
        wordWrap: { width: 470 }
      }));
    }

    this.layer.add(this.add.text(300, 238, 'Entdeckte sichere Reisepunkte', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#cdeaff'
    }));
    view.destinations.forEach((destination, index) => {
      const y = 278 + index * 44;
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

  private sectionTitle(label: string): void {
    this.layer.add(this.add.text(300, 124, label, {
      fontFamily: 'sans-serif',
      fontSize: '19px',
      color: '#e9c56c'
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
