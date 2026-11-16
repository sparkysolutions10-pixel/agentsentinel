/**
 * MasterEnterpriseUtilsLoader - Unified registry orchestrator for all 100 enterprise utilities.
 */
export interface RegisteredUtilityModule {
    id: number;
    name: string;
    category: 'encoders' | 'crypto' | 'prompt_security' | 'network' | 'schema' | 'observability' | 'stellar' | 'fs' | 'resilience' | 'compliance';
    status: 'ONLINE' | 'STANDBY';
}
export declare class MasterEnterpriseUtilsLoader {
    private static readonly UTILITY_CATALOG;
    static getCatalog(): RegisteredUtilityModule[];
    static verifyCatalogIntegrity(): {
        totalModules: number;
        allOnline: boolean;
    };
}
//# sourceMappingURL=master_enterprise_utils_loader.d.ts.map