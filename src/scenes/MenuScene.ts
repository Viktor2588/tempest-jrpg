import Phaser from 'phaser';
import type { EquipmentSlot } from '../data';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
  buildMenuView,
  calculateMemberStats,
  EQUIPMENT_SLOTS,
  equipItem,
  getAvailableJobs,
  getDefaultJobId,
  MENU_TOUCH_TARGET_PX,
  selectJob,
  type MenuGameState,
  type MenuView,
  unequipItem,
  useItem
} from '../systems/menu';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';

type MenuTab = 'party' | 'inventory' | 'equipment' | 'status' | 'jobs';

const TABS: ReadonlyArray<{ id: MenuTab; label: string }> = [
  { id: 'party', label: 'Party' },
  { id: 'inventory', label: 'Inventar' },
  { id: 'equipment', label: 'Ausrüstung' },
  { id: 'status', label: 'Status' },
  { id: 'jobs', label: 'Rollen' }
];

export class MenuScene extends Phaser.Scene {
  private save!: SaveGameV2;
  private state!: MenuGameState;
  private selectedTab: MenuTab = 'party';
  private selectedMemberIndex = 0;
  private jobAssignments: Record<string, string> = {};
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
    this.jobAssignments = Object.fromEntries(
      this.state.party.map((member) => [member.characterId, getDefaultJobId(member.characterId)])
    );

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.82);
    this.layer = this.add.container(0, 0);
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-M', () => this.close());
    this.refresh();
  }

  private refresh(): void {
    this.layer.removeAll(true);
    const view = buildMenuView(this.state, this.jobAssignments);
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
    else this.drawJobs(view, selected.member.characterId);
  }

  private drawMemberList(view: MenuView): void {
    this.layer.add(this.add.text(24, 136, 'Party', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#cdeaff'
    }));

    view.members.forEach((summary, index) => {
      const y = 174 + index * 54;
      const stats = summary.stats;
      this.button(24, y, 232, `${summary.character.name}  Lv.${summary.member.level}`, () => {
        this.selectedMemberIndex = index;
        this.refresh();
      }, this.selectedMemberIndex === index ? 0x30506f : 0x162238);
      this.layer.add(this.add.text(38, y + 16, `${summary.job.name} · LP ${summary.member.currentHp}/${stats.maxHp} · MP ${summary.member.currentMp}/${stats.maxMp}`, {
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
      const stats = summary.stats;
      this.panel(300, y, 600, 66);
      this.layer.add(this.add.text(318, y - 24, `${summary.character.name} · ${summary.character.species} · ${summary.job.name}`, {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#e9eef7'
      }));
      this.layer.add(this.add.text(318, y, `LP ${summary.member.currentHp}/${stats.maxHp}  MP ${summary.member.currentMp}/${stats.maxMp}  ATK ${stats.attack}  DEF ${stats.defense}  MAG ${stats.magic}  SPI ${stats.spirit}  AGI ${stats.agility}`, {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#9fb2cc'
      }));
      this.layer.add(this.add.text(318, y + 20, `Skills: ${summary.skills.map((skill) => skill.name).join(', ') || '—'}`, {
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
      const y = 160 + index * 58;
      this.panel(300, y, 290, 46);
      this.layer.add(this.add.text(318, y - 12, `${slotLabel(slot)}: ${item?.name ?? 'Leer'}`, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#e9eef7'
      }));
      if (item) {
        this.button(500, y, 78, 'Ablegen', () => this.applyResult(unequipItem(this.state, characterId, slot)));
      }
    });

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

    const stats = summary.stats;
    this.panel(300, 170, 570, 110);
    this.layer.add(this.add.text(318, 130, `${summary.character.name} · ${summary.character.role}`, {
      fontFamily: 'sans-serif',
      fontSize: '17px',
      color: '#e9eef7'
    }));
    this.layer.add(this.add.text(318, 162, `LP ${stats.maxHp}  MP ${stats.maxMp}  Angriff ${stats.attack}  Verteidigung ${stats.defense}`, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#9fb2cc'
    }));
    this.layer.add(this.add.text(318, 188, `Magie ${stats.magic}  Geist ${stats.spirit}  Tempo ${stats.agility}`, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#9fb2cc'
    }));
    summary.skills.forEach((skill, index) => {
      this.layer.add(this.add.text(318, 250 + index * 34, `${skill.name} (${skill.costMp} MP): ${skill.description}`, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#cbd6e8',
        wordWrap: { width: 540 }
      }));
    });
  }

  private drawJobs(view: MenuView, characterId: string): void {
    this.sectionTitle('Rollen / Jobs');
    const currentJobId = this.jobAssignments[characterId] ?? getDefaultJobId(characterId);

    getAvailableJobs(characterId).forEach((job, index) => {
      const y = 158 + index * 66;
      const previewStats = calculateMemberStats(view.members[this.selectedMemberIndex]!.member, job.id);
      this.button(300, y, 210, job.name, () => {
        const result = selectJob(this.jobAssignments, characterId, job.id);
        if (result.ok) this.jobAssignments = { ...result.state };
        this.message = result.message;
        this.refresh();
      }, currentJobId === job.id ? 0x30506f : 0x1b2940);
      this.layer.add(this.add.text(528, y - 16, job.description, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#9fb2cc',
        wordWrap: { width: 340 }
      }));
      this.layer.add(this.add.text(528, y + 14, `LP ${previewStats.maxHp} · MP ${previewStats.maxMp} · ATK ${previewStats.attack} · DEF ${previewStats.defense} · MAG ${previewStats.magic} · AGI ${previewStats.agility}`, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#6f83a5'
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
      autoSave(window.localStorage, this.save);
    }
    this.refresh();
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
    this.layer.add(this.add.rectangle(x, y, width, height, 0x121b2a, 0.9)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x33445f, 0.7));
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
    const background = this.add.rectangle(x, y, width, height, color, 0.96)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x68d7ff, 0.55)
      .setInteractive();
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
}

function slotLabel(slot: EquipmentSlot): string {
  if (slot === 'weapon') return 'Waffe';
  if (slot === 'armor') return 'Rüstung';
  return 'Accessoire';
}
