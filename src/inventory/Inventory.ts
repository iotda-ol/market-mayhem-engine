export class Inventory {
  private items: Map<string, number>;

  constructor() {
    this.items = new Map();
  }

  public addItem(itemId: string, quantity: number): void {
    const current = this.items.get(itemId) ?? 0;
    this.items.set(itemId, current + quantity);
  }

  public removeItem(itemId: string, quantity: number): boolean {
    const current = this.items.get(itemId) ?? 0;
    if (current < quantity) return false;
    if (current === quantity) {
      this.items.delete(itemId);
    } else {
      this.items.set(itemId, current - quantity);
    }
    return true;
  }

  public getQuantity(itemId: string): number {
    return this.items.get(itemId) ?? 0;
  }

  public hasItem(itemId: string): boolean {
    return (this.items.get(itemId) ?? 0) > 0;
  }

  public listItems(): Array<{ itemId: string; quantity: number }> {
    return Array.from(this.items.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity,
    }));
  }

  public clear(): void {
    this.items.clear();
  }
}
