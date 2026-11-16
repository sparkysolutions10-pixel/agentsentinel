/**
 * TempFileNameGenerator - Collision-resistant secure temporary file name generator.
 */
export interface TempFileOptions {
    prefix?: string;
    extension?: string;
    dir?: string;
}
export declare class TempFileNameGenerator {
    static generate(options?: TempFileOptions): string;
}
//# sourceMappingURL=temp_file_name_generator.d.ts.map