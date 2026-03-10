import { Loadout } from './Loadout';
import { Inventory } from '../inventory/Inventory';

export class Player {
  public readonly id: string;
  public readonly name: string;
  public cash: number;
  public health: number;
  public location: string;
  public readonly inventory: Inventory;
  public readonly loadout: Loadout;

  constructor(id: string, name: string, loadout: Loadout) {
    this.id = id;
    this.name = name;
    this.loadout = loadout;
    this.cash = loadout.startingCash;
    this.health = loadout.startingHealth;
    this.location = '';
    this.inventory = new Inventory();
    for (const item of loadout.items) {
      this.inventory.addItem(item.itemId, item.quantity);
    }
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public heal(amount: number): void {
    this.health = Math.min(this.loadout.startingHealth, this.health + amount);
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  public spendCash(amount: number): boolean {
    if (this.cash < amount) return false;
    this.cash -= amount;
    return true;
  }

  public gainCash(amount: number): void {
    this.cash += amount;
  }
}
