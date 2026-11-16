export class SorobanValTypeClassifier {
    static classify(val) {
        if (val === null || val === undefined)
            return 'Void';
        if (typeof val === 'boolean')
            return 'Boolean';
        if (typeof val === 'number' || typeof val === 'bigint')
            return 'Integer';
        if (typeof val === 'string') {
            if (val.startsWith('G') && val.length === 56)
                return 'Address';
            if (val.startsWith('C') && val.length === 56)
                return 'Address';
            return 'String';
        }
        return 'Unknown';
    }
}
//# sourceMappingURL=soroban_val_type_classifier.js.map