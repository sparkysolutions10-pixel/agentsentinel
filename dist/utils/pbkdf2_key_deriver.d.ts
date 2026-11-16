export interface Pbkdf2Options {
    iterations?: number;
    keylen?: number;
    digest?: string;
}
export declare class Pbkdf2KeyDeriver {
    static deriveKey(password: string, salt: string | Buffer, options?: Pbkdf2Options): Buffer;
    static deriveHexKey(password: string, salt: string | Buffer, options?: Pbkdf2Options): string;
}
//# sourceMappingURL=pbkdf2_key_deriver.d.ts.map