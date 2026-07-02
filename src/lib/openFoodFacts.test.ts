import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapOffProduct } from './openFoodFacts';

describe('mapOffProduct', () => {
  it('maps nutriments to FoodSearchItem', () => {
    const item = mapOffProduct({
      code: '123',
      product_name: 'Greek Yogurt',
      brands: 'Acme,Demo',
      nutriments: {
        proteins_serving: 15,
        'energy-kcal_serving': 120,
        carbohydrates_100g: 4,
        fat_100g: 2,
        serving_size: '170g',
      },
    });
    assert.ok(item);
    assert.equal(item!.name, 'Greek Yogurt');
    assert.equal(item!.protein, 15);
    assert.equal(item!.brand, 'Acme');
  });

  it('returns null when no name or macros', () => {
    assert.equal(mapOffProduct({ code: '1' }), null);
  });
});
