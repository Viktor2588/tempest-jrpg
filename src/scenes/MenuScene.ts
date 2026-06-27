import Phaser from 'phaser';
import type { EquipmentSlot } from '../data';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
  buildMenuView,
  EQUIPMENT_SLOTS,
  equipItem,
  MENU_TOUCH_TARGET_PX,
  type MenuGameState,
  type MenuView,
  unequipItem,
  useItem
} from '../systems/menu';
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
import { buildCodexView, buildQuestLog, createWorldState } from '../systems/world';
import { addUiButtonBackground, addUiPanel, addUiPortraitFrame } from '../render/uiSkin';
import { portraitKey } from '../render/portraitAtlas';
import type { PortraitKind } from '../render/artSpec';

type MenuTab = 'party' | 'inventory' | 'equipment' | 'status' | 'growth' | 'quests' | 'codex';

const TABS: ReadonlyArray<{ id: MenuTab; label: string }> = [
  { id: 'party', label: 'Party' },
  { id: 'inventory', label: 'Inventar' },
  { id: 'equipment', label: 'Ausrüstung' },
  { id: 'status', label: 'Status' },
  { id: 'growth', label: 'Talente' },
  { id: 'quests', label: 'Quests' },
  { id: 'codex', label: 'Codex' }
];

export class MenuScene extends Phaser.Scene {
  private save!: SaveGameV2;
  private state!: MenuGameState;
  private selectedTab: MenuTab = 'party';
  private selectedMemberIndex = 0;
  private layer!: Phaser.GameObjects.Container;
  private message = 'Menü geöffnet.';

  constructor() {
    super('Menu');
  }

  create(): void {
    this.save = loadSave(window.localStorage) ?? createNewSave();
    this.state = {
      party: this.save.party.active,
      inventory: this.save.inventory.stacks,
      gold: this.save.party.gold
    };

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.82);
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
        this.refresh();
      }, this.selectedTab === tab.id ? 0x30506f : 0x1b2940);
    });

    this.drawMemberList(view);

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
    else if (this.selectedTab === 'quests') this.drawQuestLog();
    else this.drawCodex();
  }

  private drawMemberList(view: MenuView): void {
    this.layer.add(this.add.text(24, 136, 'Party', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#cdeaff'
    }));

    view.members.forEach((summary, index) => {
      const y = 174 + index * 54;
      const stats = calculateProgressionStats(
        summary.member,
        this.save.progression
      );
      this.button(24, y, 232, `${summary.member.name}  Lv.${summary.member.level}`, () => {
        this.selectedMemberIndex = index;
        this.refresh();
      }, this.selectedMemberIndex === index ? 0x30506f : 0x162238);
      this.layer.add(this.add.text(38, y + 16, `${summary.character.role} · LP ${summary.member.currentHp}/${stats.maxHp} · MP ${summary.member.currentMp}/${stats.maxMp}`, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#9fb2cc'
      }));
    });
  }

  private drawParty(_selectedName: string, view: MenuView): void {
    this.sectionTitle('Party-Übersicht');
    view.members.forEach((summary, index) => {
      const y = 154 + index * 78;
      const stats = calculateProgressionStats(
        summary.member,
        this.save.progression
      );
      const formName = getActiveEvolution(
        this.save.progression,
        summary.member.characterId
      )?.formName ?? summary.character.species;
      this.panel(300, y, 600, 66);
      this.drawPortrait(summary.member.characterId, 336, y, 46);
      this.layer.add(this.add.text(372, y - 24, `${summary.member.name} · ${formName} · ${summary.character.role}`, {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#e9eef7'
      }));
      this.layer.add(this.add.text(372, y, `LP ${summary.member.currentHp}/${stats.maxHp}  MP ${summary.member.currentMp}/${stats.maxMp}  ATK ${stats.attack}  DEF ${stats.defense}  MAG ${stats.magic}  SPI ${stats.spirit}  AGI ${stats.agility}`, {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#9fb2cc'
      }));
      const skills = getProgressionSkills(
        summary.member,
        this.save.progression
      );
      this.layer.add(this.add.text(372, y + 20, `Skills: ${skills.map((skill) => skill.name).join(', ') || '—'}`, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#6f83a5'
      }));
    });
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
      const y = 160 + index * 88;
      this.panel(300, y, 290, 46);
      this.layer.add(this.add.text(318, y - 14, slotLabel(slot), {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#9fb2cc'
      }));
      this.layer.add(this.add.text(
        318,
        y + 4,
        `${item?.name ?? 'Leer'}${enchantmentLevel > 0 ? ` +${enchantmentLevel}` : ''}`,
        {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#e9eef7'
        }
      ));
      if (item) {
        this.button(500, y, 78, 'Ablegen', () => this.applyResult(unequipItem(this.state, characterId, slot)));
        if (item.enchantment && enchantmentLevel < item.enchantment.maxLevel) {
          const cost = item.enchantment.goldCostPerLevel * (enchantmentLevel + 1);
          this.button(300, y + 25, 278, `Verzaubern · ${cost} Gold`, () => {
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
    this.sectionTitle('Status & Skills');
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    const stats = calculateProgressionStats(
      summary.member,
      this.save.progression
    );
    this.panel(300, 170, 570, 110);
    const formName = getActiveEvolution(this.save.progression, characterId)?.formName
      ?? summary.character.species;
    this.drawPortrait(characterId, 348, 176, 64);
    this.layer.add(this.add.text(396, 130, `${summary.member.name} · ${formName} · ${summary.character.role}`, {
      fontFamily: 'sans-serif',
      fontSize: '17px',
      color: '#e9eef7'
    }));
    this.layer.add(this.add.text(396, 162, `LP ${stats.maxHp}  MP ${stats.maxMp}  Angriff ${stats.attack}  Verteidigung ${stats.defense}`, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#9fb2cc'
    }));
    this.layer.add(this.add.text(396, 188, `Magie ${stats.magic}  Geist ${stats.spirit}  Tempo ${stats.agility}`, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#9fb2cc'
    }));
    getProgressionSkills(
      summary.member,
      this.save.progression
    ).forEach((skill, index) => {
      this.layer.add(this.add.text(318, 250 + index * 34, `${skill.name} (${skill.costMp} MP): ${skill.description}`, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#cbd6e8',
        wordWrap: { width: 540 }
      }));
    });
  }

  private drawGrowth(view: MenuView, characterId: string): void {
    this.sectionTitle('Namensgebung, Entwicklung & Bindungen');
    const summary = view.members.find((member) => member.member.characterId === characterId);
    if (!summary) return;

    const activeEvolution = getActiveEvolution(this.save.progression, characterId);
    const availableEvolution = getAvailableEvolutions(summary.member, this.save.progression)[0];
    this.layer.add(this.add.text(
      300,
      150,
      `Name: ${summary.member.name} · Form: ${activeEvolution?.formName ?? summary.character.species}`,
      {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#e9eef7'
      }
    ));
    this.button(300, 190, 132, 'Neu benennen', () => {
      const proposed = window.prompt('Neuer Name', summary.member.name);
      if (proposed === null) return;
      const result = renameMember(summary.member, proposed, this.save.progression);
      this.replaceMember(result.member);
      this.save = { ...this.save, progression: result.state };
      this.message = result.message;
      if (result.ok) this.persist();
      this.refresh();
    });
    if (availableEvolution) {
      this.button(446, 190, 142, 'Entwickeln', () => {
        const result = evolveMember(
          summary.member,
          this.save.progression,
          availableEvolution.id
        );
        this.replaceMember(result.member);
        this.save = { ...this.save, progression: result.state };
        this.message = result.message;
        if (result.ok) this.persist();
        this.refresh();
      }, 0x3b3154);
    }

    const tree = getSkillTree(characterId);
    const points = this.save.progression.skillPointsByCharacterId[characterId] ?? 0;
    this.layer.add(this.add.text(300, 228, `${tree?.name ?? 'Skill-Baum'} · ${points} Punkte`, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#e9c56c'
    }));
    tree?.nodes.forEach((node, index) => {
      const unlocked = (
        this.save.progression.unlockedSkillNodeIdsByCharacterId[characterId] ?? []
      ).includes(node.id);
      const y = 266 + index * 62;
      this.button(300, y, 210, `${unlocked ? 'Aktiv' : `${node.cost} SP`} · ${node.name}`, () => {
        const result = unlockSkillNode(summary.member, this.save.progression, node.id, {
          flags: this.save.flags
        });
        this.applyProgressionResult(result);
      }, unlocked ? 0x1f3a2f : 0x1b2940);
      this.layer.add(this.add.text(522, y - 14, node.description, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#9fb2cc',
        wordWrap: { width: 155 }
      }));
    });

    this.layer.add(this.add.text(700, 150, 'Bindungen', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#e9c56c'
    }));
    getProgressionRelationships(characterId).forEach((relationship, index) => {
      const level = getRelationshipLevelNumber(this.save.progression, relationship.id);
      const pointsValue = this.save.progression.relationshipPoints[relationship.id] ?? 0;
      this.layer.add(this.add.text(
        700,
        184 + index * 62,
        `${relationship.partnerName} · Stufe ${level}\n${pointsValue} Bindungspunkte`,
        {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#cbd6e8',
          lineSpacing: 4
        }
      ));
    });
  }

  private drawQuestLog(): void {
    this.sectionTitle('Quests & Story');
    const quests = buildQuestLog(createWorldState(this.save));
    quests.forEach((quest, index) => {
      const y = 160 + index * 132;
      const status = quest.status === 'completed'
        ? 'Abgeschlossen'
        : quest.status === 'active'
          ? 'Aktiv'
          : 'Offen';
      this.panel(300, y, 590, 108);
      this.layer.add(this.add.text(318, y - 42, `${quest.title} · ${status}`, {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: quest.status === 'completed' ? '#8dffc2' : quest.status === 'active' ? '#e9c56c' : '#9fb2cc'
      }));
      // Aktive Quests zeigen den aktuellen Schritt als Wegführung statt der generischen Beschreibung.
      const currentStep = quest.status === 'active' ? quest.steps.find((step) => step.current) : undefined;
      this.layer.add(this.add.text(318, y - 18, currentStep ? `→ ${currentStep.description}` : quest.description, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: currentStep ? '#e9c56c' : '#9fb2cc',
        wordWrap: { width: 535 }
      }));
      const visibleSteps = quest.steps
        .filter((step) => step.completed || step.current || quest.status === 'completed')
        .slice(0, 3);
      visibleSteps.forEach((step, stepIndex) => {
        const marker = step.completed ? '✓' : step.current ? '◆' : '·';
        this.layer.add(this.add.text(318, y + 12 + stepIndex * 18, `${marker} ${step.title}`, {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: step.completed ? '#8dffc2' : step.current ? '#e9eef7' : '#6f83a5'
        }));
      });
      this.layer.add(this.add.text(704, y + 44, `Belohnung: ${quest.rewardGold} Gold`, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#e9c56c'
      }));
    });
  }

  private drawCodex(): void {
    this.sectionTitle('Codex');
    const entries = buildCodexView(createWorldState(this.save));
    entries.forEach((entry, index) => {
      const y = 158 + index * 86;
      this.panel(300, y, 590, 68);
      this.layer.add(this.add.text(318, y - 24, `${entry.unlocked ? '◈' : '◇'} ${entry.title}`, {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: entry.unlocked ? '#e9c56c' : '#6f83a5'
      }));
      this.layer.add(this.add.text(318, y - 2, entry.unlocked ? entry.body ?? '' : 'Noch nicht entdeckt.', {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: entry.unlocked ? '#cbd6e8' : '#6f83a5',
        wordWrap: { width: 540 }
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
        active: this.state.party
      }
    };
  }

  private persist(): void {
    this.save = autoSave(window.localStorage, {
      ...this.save,
      party: {
        ...this.save.party,
        active: this.state.party,
        gold: this.state.gold
      },
      inventory: {
        stacks: this.state.inventory
      }
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
    const height = MENU_TOUCH_TARGET_PX;
    const background = addUiButtonBackground(this, x, y, width, height, color);
    const text = this.add.text(x + 10, y, label, {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#e9eef7'
    }).setOrigin(0, 0.5);
    background.on('pointerover', () => background.setFillStyle(0x274062, 1));
    background.on('pointerout', () => background.setFillStyle(color, 0.96));
    background.on('pointerdown', callback);
    this.layer.add(background);
    this.layer.add(text);
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

function portraitKeyForCharacter(characterId: string): string | null {
  if (isPortraitKind(characterId)) {
    return portraitKey(characterId);
  }
  return null;
}

function isPortraitKind(value: string): value is PortraitKind {
  return ['rimuru', 'gobta', 'shuna', 'sora', 'vael', 'lyrre', 'rigurd', 'mordrahn'].includes(value);
}
