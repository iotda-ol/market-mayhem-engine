import { EncounterSystem } from '../src/encounter/EncounterSystem';
import { Player } from '../src/player/Player';
import { LOADOUTS } from '../src/player/Loadout';

function makePlayer(): Player {
  return new Player('p1', 'Alice', LOADOUTS.MERCHANT);
}

describe('EncounterSystem', () => {
  describe('checkForEncounter', () => {
    it('returns true when random value is below probability', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      const system = new EncounterSystem(0.4, []);
      expect(system.checkForEncounter()).toBe(true);
    });

    it('returns false when random value is at or above probability', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const system = new EncounterSystem(0.4, []);
      expect(system.checkForEncounter()).toBe(false);
    });

    it('uses the configured probability', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const system = new EncounterSystem(1.0, []);
      expect(system.checkForEncounter()).toBe(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('resolveEncounter - pay', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('reduces player cash', () => {
      // 0.2 + random()*0.2 cash loss → mock random for determinism
      // First call for cashLoss calculation: 0.2 + 0*0.2 = 20% loss
      // Second call for stock check: 0.5 (above 0.3, so no stock loss)
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const system = new EncounterSystem(0.4, []);
      const player = makePlayer();
      const cashBefore = player.cash;
      const result = system.resolveEncounter(player, 'pay');
      expect(result.outcome).toBe('paid');
      expect(player.cash).toBeLessThan(cashBefore);
      expect(result.cashChange).toBeLessThan(0);
    });

    it('outcome is paid', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const system = new EncounterSystem(0.4, []);
      const player = makePlayer();
      const result = system.resolveEncounter(player, 'pay');
      expect(result.outcome).toBe('paid');
    });
  });

  describe('resolveEncounter - run', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('escapes successfully when random favors escape', () => {
      // escape chance is 0.6; mock random to be 0.1 (< 0.6)
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      const system = new EncounterSystem(0.4, ['downtown', 'harbor']);
      const player = makePlayer();
      const result = system.resolveEncounter(player, 'run');
      expect(result.outcome).toBe('escaped');
      expect(result.newLocation).toBeDefined();
    });

    it('fails to escape and pays when random is high', () => {
      // escape chance is 0.6; mock random to be 0.9 (>= 0.6), then for pay: cashLoss = 0
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const system = new EncounterSystem(0.4, ['downtown']);
      const player = makePlayer();
      const result = system.resolveEncounter(player, 'run');
      expect(result.outcome).toBe('paid');
    });

    it('speedboots increase escape chance', () => {
      // With speedboots: escapeChance = 0.9; mock 0.85 (< 0.9) → escaped
      jest.spyOn(Math, 'random').mockReturnValue(0.85);
      const system = new EncounterSystem(0.4, ['downtown']);
      const player = makePlayer();
      player.inventory.addItem('speedboots', 1);
      const result = system.resolveEncounter(player, 'run');
      expect(result.outcome).toBe('escaped');
    });
  });

  describe('resolveEncounter - fight', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('is victorious when random favors win', () => {
      // victory chance 0.5; mock 0.1 → victorious
      // moneyGain = floor(100 + 0.1*500) = 150
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      const system = new EncounterSystem(0.4, []);
      const player = makePlayer();
      const cashBefore = player.cash;
      const result = system.resolveEncounter(player, 'fight');
      expect(result.outcome).toBe('victorious');
      expect(player.cash).toBeGreaterThan(cashBefore);
      expect(result.cashChange).toBeGreaterThan(0);
    });

    it('is captured and takes damage when random is high', () => {
      // victory chance 0.5; mock 0.9 → captured
      // damageTaken = floor(10 + 0.9*30) = 37, no armor → actualDamage = 37
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const system = new EncounterSystem(0.4, []);
      const player = makePlayer();
      const healthBefore = player.health;
      const result = system.resolveEncounter(player, 'fight');
      expect(result.outcome).toBe('captured');
      expect(player.health).toBeLessThan(healthBefore);
      expect(result.healthChange).toBeLessThan(0);
    });

    it('bodyarmor reduces damage', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const systemWithArmor = new EncounterSystem(0.4, []);
      const playerWithArmor = makePlayer();
      playerWithArmor.inventory.addItem('bodyarmor', 1);
      const healthBefore = playerWithArmor.health;
      systemWithArmor.resolveEncounter(playerWithArmor, 'fight');

      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const systemNoArmor = new EncounterSystem(0.4, []);
      const playerNoArmor = makePlayer();
      const healthBeforeNoArmor = playerNoArmor.health;
      systemNoArmor.resolveEncounter(playerNoArmor, 'fight');

      const damageWithArmor = healthBefore - playerWithArmor.health;
      const damageNoArmor = healthBeforeNoArmor - playerNoArmor.health;
      expect(damageWithArmor).toBeLessThan(damageNoArmor);
    });
  });

  describe('health reaching zero', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('player health can reach zero from fight', () => {
      // Mock fight to always lose with high damage
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const system = new EncounterSystem(0.4, []);
      const loadout = { ...LOADOUTS.MERCHANT, startingHealth: 10 };
      const player = new Player('p1', 'Alice', loadout);
      // Take heavy pre-damage
      player.takeDamage(9);
      system.resolveEncounter(player, 'fight');
      expect(player.isAlive()).toBe(false);
    });
  });
});
