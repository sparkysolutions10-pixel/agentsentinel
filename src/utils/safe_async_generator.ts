export class SafeAsyncGenerator {
  public static async toArray<T>(generator: AsyncIterable<T>, maxItems: number = 1000): Promise<T[]> {
    const items: T[] = [];
    for await (const item of generator) {
      items.push(item);
      if (items.length >= maxItems) break;
    }
    return items;
  }
}
