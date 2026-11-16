import { Verdict } from '../types.js';
export function createExifMetadataScrubberRule() {
    return {
        id: 'rag-exif-metadata-scrubber',
        name: 'Scrub Sensitive EXIF Geolocation from Multimodal Vectors',
        category: 'custom',
        priority: 870,
        enabled: true,
        evaluate: (ctx) => {
            const meta = JSON.stringify(ctx.params?.imageMetadata || ctx.params?.exif || '');
            const lower = meta.toLowerCase();
            if (lower.includes('gpslatitude') || lower.includes('gpslongitude') || lower.includes('cameramake') || lower.includes('deviceserial')) {
                return {
                    ruleId: 'rag-exif-metadata-scrubber',
                    ruleName: 'Scrub Sensitive EXIF Geolocation from Multimodal Vectors',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: 'Multimodal vector payload contains raw unredacted EXIF GPS or device serial metadata.',
                    detectedPattern: 'unredacted-exif-metadata',
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=exif_metadata_scrubber.js.map