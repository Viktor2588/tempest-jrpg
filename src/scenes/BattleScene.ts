import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
  startBattle, act, enemyTurn, isPlayerTurn, currentActor, renderView,
  type BattleState, type CombatantView
} from '../systems/battle';
import { DEMO_PARTY } from '../data/units';
import { getSkill } from '../data/skills';

type Mode = 'busy' | 'menu' | 'skills' | 'target-enemy' | 'target-ally';

// Darstellung des Rundenkampfs. Treibt nur die reine battle-Engine an und
// rendert deren View-Modell; Schaden/Zugreihenfolge bleiben in der Engine.
export class BattleScene extends Phaser.Scene {
  private state!: BattleState;
  private mode: Mode = 'busy';
  private pendingSkillId: string | null = null;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super('Battle');
  }

  create(data: { enemyIds?: string[] }): void {
    const enemyIds = data?.enemyIds ?? ['goblin', 'goblin', 'imp'];
    this.state = startBattle(DEMO_PARTY, enemyIds, (Date.now() & 0x7fffffff) || 1);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0c1018);
    this.layer = this.add.container(0, 0);
    this.afterAction();
  }

  // ---------- Ablaufsteuerung ----------
  private afterAction(): void {
    if (this.state.status !== 'active') { this.mode = 'busy'; this.refresh(); return; }
    if (isPlayerTurn(this.state)) { this.mode = 'menu'; this.refresh(); return; }
    // Gegnerzug mit kurzer Pause
    this.mode = 'busy';
    this.refresh();
    this.time.delayedCall(420, () => { enemyTurn(this.state); this.afterAction(); });
  }

  private doAct(action: Parameters<typeof act>[1]): void {
    const r = act(this.state, action);
    if (!r.ok) { this.flash(r.reason ?? 'Geht nicht.'); return; }
    this.pendingSkillId = null;
    this.afterAction();
  }

  // ---------- Darstellung ----------
  private refresh(): void {
    this.layer.removeAll(true);
    const v = renderView(this.state);

    // Gegner (oben), Party (unten)
    v.enemies.forEach((e, i) => this.drawUnit(e, this.colX(i, v.enemies.length), 150, 'enemy'));
    v.party.forEach((p, i) => this.drawUnit(p, this.colX(i, v.party.length), 360, 'party'));

    // Log (oben links)
    v.log.slice(0, 3).forEach((line, i) => {
      this.layer.add(this.add.text(16, 14 + i * 16, line, { fontFamily: 'sans-serif', fontSize: '12px', color: i === 0 ? '#e9d8a8' : '#7d8aa0' }));
    });

    if (this.state.status !== 'active') { this.drawResult(v.status, v.rewards); return; }

    const actor = currentActor(this.state);
    const who = actor ? `${actor.name} ist am Zug` : '';
    this.layer.add(this.add.text(GAME_WIDTH / 2, 250, who, { fontFamily: 'sans-serif', fontSize: '15px', color: '#cdeaff' }).setOrigin(0.5));

    if (this.mode === 'menu') this.drawMenu();
    else if (this.mode === 'skills') this.drawSkillList();
    else if (this.mode === 'target-enemy') this.drawHint('Ziel-Gegner wählen (tippen)');
    else if (this.mode === 'target-ally') this.drawHint('Verbündeten wählen (tippen)');
  }

  private colX(i: number, n: number): number {
    const span = Math.min(GAME_WIDTH - 120, n * 150);
    const start = (GAME_WIDTH - span) / 2 + span / (n * 2);
    return start + (i * span) / n;
  }

  private drawUnit(u: CombatantView, x: number, y: number, side: 'party' | 'enemy'): void {
    const w = 96, alpha = u.dead ? 0.3 : 1;
    const box = this.add.rectangle(x, y, w, 56, side === 'enemy' ? 0x3a2230 : 0x223049, 0.9 * alpha)
      .setStrokeStyle(u.active ? 3 : 1, u.active ? 0xffe08a : 0x4a5876);
    this.layer.add(box);
    this.layer.add(this.add.text(x, y - 20, u.name + (u.guarding ? ' 🛡' : ''), { fontFamily: 'sans-serif', fontSize: '12px', color: '#e9eef7' }).setOrigin(0.5).setAlpha(alpha));
    // HP-Balken
    this.layer.add(this.add.rectangle(x, y, w - 12, 8, 0x10151f).setOrigin(0.5));
    this.layer.add(this.add.rectangle(x - (w - 12) / 2, y, Math.max(0, (w - 12) * (u.hp / u.maxHp)), 8, u.dead ? 0x555 : 0x53d98b).setOrigin(0, 0.5));
    this.layer.add(this.add.text(x, y + 14, `${u.hp}/${u.maxHp}${u.maxMp ? '  MP ' + u.mp : ''}`, { fontFamily: 'sans-serif', fontSize: '10px', color: '#9fb2cc' }).setOrigin(0.5).setAlpha(alpha));
    if (u.statuses.includes('gift')) this.layer.add(this.add.text(x + w / 2 - 8, y - 22, '☠', { fontSize: '12px', color: '#b06bff' }).setOrigin(0.5));

    // In Zielwahl anklickbar
    const wantEnemy = this.mode === 'target-enemy' && side === 'enemy';
    const wantAlly = this.mode === 'target-ally' && side === 'party';
    if (!u.dead && (wantEnemy || wantAlly)) {
      box.setInteractive().setStrokeStyle(2, 0x68ff9a);
      box.on('pointerdown', () => {
        if (this.pendingSkillId) this.doAct({ type: 'skill', skillId: this.pendingSkillId, targetId: u.id });
        else this.doAct({ type: 'attack', targetId: u.id });
      });
    }
  }

  private drawMenu(): void {
    const actor = currentActor(this.state)!;
    const items: Array<[string, () => void]> = [
      ['⚔ Angriff', () => { this.mode = 'target-enemy'; this.pendingSkillId = null; this.refresh(); }],
      ['✨ Magie', () => { this.mode = 'skills'; this.refresh(); }],
      ['🛡 Verteidigen', () => this.doAct({ type: 'guard' })],
      ['🏃 Fliehen', () => this.doAct({ type: 'flee' })]
    ];
    if (!actor.skills.length) items.splice(1, 1); // ohne Fähigkeiten kein Magie-Knopf
    items.forEach(([label, cb], i) => this.button(GAME_WIDTH - 150, 300 + i * 44, label, cb));
  }

  private drawSkillList(): void {
    const actor = currentActor(this.state)!;
    actor.skills.forEach((id, i) => {
      const sk = getSkill(id); if (!sk) return;
      this.button(GAME_WIDTH - 150, 290 + i * 40, `${sk.name} (${sk.mp})`, () => {
        if (actor.mp < sk.mp) { this.flash('Nicht genug MP.'); return; }
        this.pendingSkillId = sk.id;
        this.mode = sk.kind === 'heilung' ? 'target-ally' : 'target-enemy';
        this.refresh();
      });
    });
    this.button(GAME_WIDTH - 150, 290 + actor.skills.length * 40, '↩ Zurück', () => { this.mode = 'menu'; this.refresh(); });
  }

  private drawResult(status: string, rewards: { exp: number; gold: number }): void {
    const won = status === 'won';
    const title = won ? '🏆 Sieg!' : status === 'fled' ? '🏃 Entkommen' : '💀 Niederlage';
    this.layer.add(this.add.text(GAME_WIDTH / 2, 250, title, { fontFamily: 'serif', fontSize: '34px', color: won ? '#e9c56c' : '#ff7b8a' }).setOrigin(0.5));
    if (won) this.layer.add(this.add.text(GAME_WIDTH / 2, 290, `+${rewards.exp} EP   +${rewards.gold} Gold`, { fontFamily: 'sans-serif', fontSize: '16px', color: '#cbd6e8' }).setOrigin(0.5));
    this.button(GAME_WIDTH / 2 - 90, 330, 'Zurück zur Welt', () => this.scene.start('Overworld'));
  }

  private drawHint(text: string): void {
    this.layer.add(this.add.text(GAME_WIDTH / 2, 470, text, { fontFamily: 'sans-serif', fontSize: '14px', color: '#9fe8ff' }).setOrigin(0.5));
    this.button(GAME_WIDTH - 150, 300, '↩ Abbrechen', () => { this.mode = 'menu'; this.pendingSkillId = null; this.refresh(); });
  }

  private button(x: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(x, y, 180, 38, 0x1b2940, 0.95).setOrigin(0, 0.5).setStrokeStyle(1, 0x68d7ff, 0.6).setInteractive();
    const txt = this.add.text(x + 12, y, label, { fontFamily: 'sans-serif', fontSize: '15px', color: '#e9eef7' }).setOrigin(0, 0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x274062, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1b2940, 0.95));
    bg.on('pointerdown', cb);
    this.layer.add(bg); this.layer.add(txt);
  }

  private flash(msg: string): void {
    const t = this.add.text(GAME_WIDTH / 2, 500, msg, { fontFamily: 'sans-serif', fontSize: '14px', color: '#ffb86b' }).setOrigin(0.5);
    this.layer.add(t);
    this.tweens.add({ targets: t, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }
}
