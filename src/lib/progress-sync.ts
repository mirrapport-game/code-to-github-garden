export type ProgressSnapshot = {intro: unknown; challenge: unknown; intro_draft: unknown};
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
/** Remote wins conflicts; independent edits and local-only fields survive. */
export function mergeProgress(base: unknown, local: unknown, remote: unknown): unknown {
  if (local === undefined || equal(local, base)) return remote;
  if (remote === undefined || equal(remote, base)) return local;
  if (object(local) && object(remote)) {
    const result = {...remote};
    for (const key of Object.keys(local)) result[key] = mergeProgress(object(base) ? base[key] : undefined, local[key], remote[key]);
    return result;
  }
  return remote;
}