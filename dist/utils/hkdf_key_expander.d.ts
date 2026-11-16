export declare class HkdfKeyExpander {
    static extract(ikm: Buffer, salt?: Buffer): Buffer;
    static expand(prk: Buffer, info: Buffer, length: number): Buffer;
    static deriveKey(ikm: Buffer, salt: Buffer, info: Buffer, length: number): Buffer;
}
//# sourceMappingURL=hkdf_key_expander.d.ts.map