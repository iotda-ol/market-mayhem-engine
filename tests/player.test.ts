import { Player } from '../src/player/Player';
import { LOADOUTS, Loadout } from '../src/player/Loadout';

describe('Player', () => {
  const merchantLoadout: Loadout = LOADOUTS.MERCHANT;
  const streetFighterLoadout: Loadout = LOADOUTS.STREET_FIGHTER;

  describe('constructor', () => {
    it('initializes with loadout values', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      expect(player.id).toBe('p1');
      expect(player.name).toBe('Alice');
      expect(player.cash).toBe(merchantLoadout.startingCash);
      expect(player.health).toBe(merchantLoadout.startingHealth);
      expect(player.location).toBe('');
      expect(player.loadout).toBe(merchantLoadout);
    });

    it('initializes inventory with loadout items', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      expect(player.inventory.hasItem('briefcase')).toBe(true);
      expect(player.inventory.getQuantity('briefcase')).toBe(1);
    });

    it('initializes Street Fighter inventory with knuckles', () => {
      const player = new Player('p2', 'Bob', streetFighterLoadout);
      expect(player.inventory.hasItem('knuckles')).toBe(true);
      expect(player.inventory.getQuantity('knuckles')).toBe(1);
    });

    it('initializes Runner inventory with sneakers', () => {
      const player = new Player('p3', 'Carol', LOADOUTS.RUNNER);
      expect(player.inventory.hasItem('sneakers')).toBe(true);
    });
  });

  describe('takeDamage', () => {
    it('reduces health by the given amount', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.takeDamage(20);
      expect(player.health).toBe(merchantLoadout.startingHealth - 20);
    });

    it('does not reduce health below 0', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.takeDamage(1000);
      expect(player.health).toBe(0);
    });

    it('can take exactly all health', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.takeDamage(merchantLoadout.startingHealth);
      expect(player.health).toBe(0);
    });
  });

  describe('heal', () => {
    it('restores health', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.takeDamage(30);
      player.heal(15);
      expect(player.health).toBe(merchantLoadout.startingHealth - 15);
    });

    it('does not exceed starting health', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.heal(1000);
      expect(player.health).toBe(merchantLoadout.startingHealth);
    });

    it('heals up to max health exactly', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.takeDamage(10);
      player.heal(10);
      expect(player.health).toBe(merchantLoadout.startingHealth);
    });
  });

  describe('isAlive', () => {
    it('returns true when health > 0', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      expect(player.isAlive()).toBe(true);
    });

    it('returns false when health is 0', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.takeDamage(merchantLoadout.startingHealth);
      expect(player.isAlive()).toBe(false);
    });
  });

  describe('spendCash', () => {
    it('deducts cash and returns true when sufficient funds', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      const result = player.spendCash(500);
      expect(result).toBe(true);
      expect(player.cash).toBe(merchantLoadout.startingCash - 500);
    });

    it('returns false and does not deduct when insufficient funds', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      const result = player.spendCash(merchantLoadout.startingCash + 1);
      expect(result).toBe(false);
      expect(player.cash).toBe(merchantLoadout.startingCash);
    });

    it('allows spending exact balance', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      const result = player.spendCash(merchantLoadout.startingCash);
      expect(result).toBe(true);
      expect(player.cash).toBe(0);
    });
  });

  describe('gainCash', () => {
    it('increases cash by the given amount', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.gainCash(300);
      expect(player.cash).toBe(merchantLoadout.startingCash + 300);
    });

    it('can gain multiple times', () => {
      const player = new Player('p1', 'Alice', merchantLoadout);
      player.gainCash(100);
      player.gainCash(200);
      expect(player.cash).toBe(merchantLoadout.startingCash + 300);
    });
  });
});
