/**
 * Safe JSON property extractor using dot and array bracket notation without eval.
 */
export declare class JsonPathExtractor {
    static get<T = any>(obj: any, path: string, defaultValue?: T): T;
    static has(obj: any, path: string): boolean;
}
//# sourceMappingURL=json_path_extractor.d.ts.map