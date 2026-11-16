export class SafeAsyncGenerator {
    static async toArray(generator, maxItems = 1000) {
        const items = [];
        for await (const item of generator) {
            items.push(item);
            if (items.length >= maxItems)
                break;
        }
        return items;
    }
}
//# sourceMappingURL=safe_async_generator.js.map