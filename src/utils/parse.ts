export function parse(obj: Object) {
  let cache: any[] | null = [];

  let str = JSON.stringify(obj, function (key, value) {
    if (!!cache && typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });

  cache = null; // reset the cache
  return JSON.parse(str);
}

