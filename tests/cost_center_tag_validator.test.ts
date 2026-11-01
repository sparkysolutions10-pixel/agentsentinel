import { describe, it, expect } from 'vitest';
import { CostCenterTagValidator } from '../src/utils/cost_center_tag_validator.js';

describe('CostCenterTagValidator', () => {
  it('validates required cost allocation tags', () => {
    const res = CostCenterTagValidator.validate({ Environment: 'prod', Owner: 'devops' }, ['Environment', 'Owner', 'Project']);
    expect(res.isValid).toBe(false);
    expect(res.missingKeys).toEqual(['Project']);

    const valid = CostCenterTagValidator.validate({ Environment: 'prod', Owner: 'devops', Project: 'sentinel' }, ['Environment', 'Owner', 'Project']);
    expect(valid.isValid).toBe(true);
  });
});
