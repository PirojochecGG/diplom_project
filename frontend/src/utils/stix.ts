import { StixBundle, StixObject } from "../types/stix";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeObject(item: unknown, fallbackSpecVersion: string): StixObject | null {
  if (!isRecord(item)) {
    return null;
  }

  const type = typeof item.type === "string" ? item.type : null;
  const id = typeof item.id === "string" ? item.id : null;
  if (!type || !id) {
    return null;
  }

  const normalized: StixObject = {
    ...item,
    type,
    id,
    spec_version: typeof item.spec_version === "string" ? item.spec_version : fallbackSpecVersion,
  };

  if (type === "report") {
    normalized.object_refs = isStringArray(item.object_refs) ? item.object_refs : [];
  }

  if (type === "relationship") {
    normalized.source_ref = typeof item.source_ref === "string" ? item.source_ref : undefined;
    normalized.target_ref = typeof item.target_ref === "string" ? item.target_ref : undefined;
    normalized.relationship_type = typeof item.relationship_type === "string" ? item.relationship_type : "related-to";
  }

  return normalized;
}

export function normalizeStixBundle(input: unknown): StixBundle {
  if (!isRecord(input)) {
    throw new Error("Bundle payload is not an object.");
  }

  if (input.type !== "bundle") {
    throw new Error("Payload is not a STIX bundle.");
  }

  if (typeof input.id !== "string") {
    throw new Error("Bundle id is missing.");
  }

  const specVersion = typeof input.spec_version === "string" ? input.spec_version : "2.1";
  const rawObjects = Array.isArray(input.objects) ? input.objects : [];
  const objects = rawObjects
    .map((item) => normalizeObject(item, specVersion))
    .filter((item): item is StixObject => item !== null);

  return {
    type: "bundle",
    id: input.id,
    spec_version: specVersion,
    objects,
  };
}

export function summarizeStixBundle(bundle: StixBundle) {
  const counts = bundle.objects.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.type] = (accumulator[item.type] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    totalObjects: bundle.objects.length,
    relationships: counts.relationship ?? 0,
    indicators: counts.indicator ?? 0,
    attackPatterns: counts["attack-pattern"] ?? 0,
    counts,
  };
}
