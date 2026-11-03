import { describe, it, expect } from 'vitest';
import { Neo4jCypherApocProcedureWhitelist } from '../src/db/neo4j_cypher_apoc_procedure_whitelist.js';

describe('Neo4jCypherApocProcedureWhitelist Invariant Suite (#1932)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Neo4jCypherApocProcedureWhitelist.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NEO4J_CYPHER_APOC_PROCEDURE_WHITELIST');
    expect(Neo4jCypherApocProcedureWhitelist.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Neo4jCypherApocProcedureWhitelist.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Neo4jCypherApocProcedureWhitelist.validate('git status && npm run test')).toBe(true);
  });
});
