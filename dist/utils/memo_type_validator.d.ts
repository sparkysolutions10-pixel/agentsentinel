/**
 * MemoTypeValidator - Stellar transaction memo validation and byte bounds checking.
 */
export type StellarMemoType = 'none' | 'text' | 'id' | 'hash' | 'return';
export interface MemoValidationResult {
    valid: boolean;
    type: StellarMemoType;
    error?: string;
}
export declare class MemoTypeValidator {
    static validateTextMemo(text: string): MemoValidationResult;
    static validateIdMemo(id: string | bigint | number): MemoValidationResult;
    static validateHashMemo(hash: string, type?: 'hash' | 'return'): MemoValidationResult;
}
//# sourceMappingURL=memo_type_validator.d.ts.map