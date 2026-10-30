import * as dicts from "./pt-BR";

type Dicts = typeof dicts;
type Namespace = keyof Dicts;

export function t(path: string): string {
  const parts = path.split(".");
  if (parts.length === 2) {
    const ns = parts[0] as Namespace;
    const key = parts[1];
    const bag = dicts[ns] as Record<string, string> | undefined;
    if (bag && bag[key]) {
      return bag[key];
    }
  }

  // Fallback busca em todas as namespaces
  for (const ns of Object.keys(dicts) as Namespace[]) {
    const bag = dicts[ns] as Record<string, string>;
    if (bag && bag[path]) {
      return bag[path];
    }
  }

  return path;
}
