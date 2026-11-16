export interface ScryptOptions {
    N?: number;
    r?: number;
    p?: number;
    keylen?: number;
}
export declare class ScryptHasher {
    static hashSync(password: string, salt: string | Buffer, options?: ScryptOptions): Buffer;
    static hashHex(password: string, salt: string | Buffer, options?: ScryptOptions): string;
}
//# sourceMappingURL=scrypt_hasher.d.ts.map