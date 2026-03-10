import { Inventory } from '../src/inventory/Inventory';

describe('Inventory', () => {
  let inventory: Inventory;

  beforeEach(() => {
    inventory = new Inventory();
  });

  describe('addItem', () => {
    it('adds a new item', () => {
      inventory.addItem('TECH', 5);
      expect(inventory.getQuantity('TECH')).toBe(5);
    });

    it('increments quantity for existing item', () => {
      inventory.addItem('TECH', 5);
      inventory.addItem('TECH', 3);
      expect(inventory.getQuantity('TECH')).toBe(8);
    });

    it('can add multiple distinct items', () => {
      inventory.addItem('TECH', 2);
      inventory.addItem('DRUG', 4);
      expect(inventory.getQuantity('TECH')).toBe(2);
      expect(inventory.getQuantity('DRUG')).toBe(4);
    });
  });

  describe('removeItem', () => {
    it('removes items and returns true', () => {
      inventory.addItem('TECH', 5);
      const result = inventory.removeItem('TECH', 3);
      expect(result).toBe(true);
      expect(inventory.getQuantity('TECH')).toBe(2);
    });

    it('removes all items and deletes the entry', () => {
      inventory.addItem('TECH', 5);
      const result = inventory.removeItem('TECH', 5);
      expect(result).toBe(true);
      expect(inventory.getQuantity('TECH')).toBe(0);
      expect(inventory.hasItem('TECH')).toBe(false);
    });

    it('returns false and does not remove when insufficient quantity', () => {
      inventory.addItem('TECH', 2);
      const result = inventory.removeItem('TECH', 5);
      expect(result).toBe(false);
      expect(inventory.getQuantity('TECH')).toBe(2);
    });

    it('returns false when item does not exist', () => {
      const result = inventory.removeItem('NONEXISTENT', 1);
      expect(result).toBe(false);
    });
  });

  describe('getQuantity', () => {
    it('returns 0 for non-existent item', () => {
      expect(inventory.getQuantity('MISSING')).toBe(0);
    });

    it('returns correct quantity for existing item', () => {
      inventory.addItem('FOOD', 10);
      expect(inventory.getQuantity('FOOD')).toBe(10);
    });
  });

  describe('hasItem', () => {
    it('returns false when item not in inventory', () => {
      expect(inventory.hasItem('TECH')).toBe(false);
    });

    it('returns true when item is in inventory', () => {
      inventory.addItem('TECH', 1);
      expect(inventory.hasItem('TECH')).toBe(true);
    });

    it('returns false after all items removed', () => {
      inventory.addItem('TECH', 2);
      inventory.removeItem('TECH', 2);
      expect(inventory.hasItem('TECH')).toBe(false);
    });
  });

  describe('listItems', () => {
    it('returns empty array when inventory is empty', () => {
      expect(inventory.listItems()).toEqual([]);
    });

    it('returns all items with quantities', () => {
      inventory.addItem('TECH', 3);
      inventory.addItem('DRUG', 1);
      const items = inventory.listItems();
      expect(items).toHaveLength(2);
      expect(items).toContainEqual({ itemId: 'TECH', quantity: 3 });
      expect(items).toContainEqual({ itemId: 'DRUG', quantity: 1 });
    });
  });

  describe('clear', () => {
    it('removes all items', () => {
      inventory.addItem('TECH', 5);
      inventory.addItem('DRUG', 3);
      inventory.clear();
      expect(inventory.listItems()).toEqual([]);
      expect(inventory.getQuantity('TECH')).toBe(0);
    });
  });
});
