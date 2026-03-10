import { Player } from '../player/Player';

export type EncounterChoice = 'pay' | 'run' | 'fight';

export type EncounterOutcome =
  | 'escaped'
  | 'victorious'
  | 'captured'
  | 'paid'
  | 'no_encounter';

export interface EncounterResult {
  outcome: EncounterOutcome;
  message: string;
  newLocation?: string;
  cashChange?: number;
  healthChange?: number;
}

export class EncounterSystem {
  private readonly encounterProbability: number;
  private readonly availableLocations: string[];

  constructor(
    encounterProbability: number = 0.4,
    availableLocations: string[] = []
  ) {
    this.encounterProbability = encounterProbability;
    this.availableLocations = availableLocations;
  }

  public checkForEncounter(): boolean {
    return Math.random() < this.encounterProbability;
  }

  public resolveEncounter(
    player: Player,
    choice: EncounterChoice
  ): EncounterResult {
    switch (choice) {
      case 'pay':
        return this.resolvePay(player);
      case 'run':
        return this.resolveRun(player);
      case 'fight':
        return this.resolveFight(player);
    }
  }

  private resolvePay(player: Player): EncounterResult {
    const cashLoss = Math.floor(player.cash * (0.2 + Math.random() * 0.2));
    player.spendCash(cashLoss);
    const stocksLost: string[] = [];
    for (const { itemId, quantity } of player.inventory.listItems()) {
      if (Math.random() < 0.3 && quantity > 0) {
        const amountLost = Math.ceil(quantity * 0.5);
        player.inventory.removeItem(itemId, amountLost);
        stocksLost.push(itemId);
      }
    }
    return {
      outcome: 'paid',
      message: `You paid off the encounter. Lost $${cashLoss}${stocksLost.length > 0 ? ` and some ${stocksLost.join(', ')} shares` : ''}.`,
      cashChange: -cashLoss,
    };
  }

  private resolveRun(player: Player): EncounterResult {
    const escapeBonus = player.inventory.hasItem('speedboots') ? 0.3 : 0;
    const escapeChance = 0.6 + escapeBonus;
    if (Math.random() < escapeChance) {
      const randomLocation =
        this.availableLocations.length > 0
          ? this.availableLocations[
              Math.floor(Math.random() * this.availableLocations.length)
            ]
          : undefined;
      return {
        outcome: 'escaped',
        message: 'You managed to escape! You ended up somewhere unexpected.',
        newLocation: randomLocation,
      };
    } else {
      return this.resolvePay(player);
    }
  }

  private resolveFight(player: Player): EncounterResult {
    const fightBonus = player.inventory.hasItem('bodyarmor') ? 0.2 : 0;
    const victoryChance = 0.5 + fightBonus;
    if (Math.random() < victoryChance) {
      const moneyGain = Math.floor(100 + Math.random() * 500);
      player.gainCash(moneyGain);
      return {
        outcome: 'victorious',
        message: `You won the fight and gained $${moneyGain}!`,
        cashChange: moneyGain,
      };
    } else {
      const damageTaken = Math.floor(10 + Math.random() * 30);
      const fightDamageReduction = player.inventory.hasItem('bodyarmor') ? 0.2 : 0;
      const actualDamage = Math.floor(damageTaken * (1 - fightDamageReduction));
      player.takeDamage(actualDamage);
      return {
        outcome: 'captured',
        message: `You lost the fight and took ${actualDamage} damage!`,
        healthChange: -actualDamage,
      };
    }
  }
}
