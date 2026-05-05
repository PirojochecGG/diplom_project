import { AttackTechnique, Feed, Incident, Ioc } from "../types/api";
import { StixBundle } from "../types/stix";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Request failed");
  }
  return response.json() as Promise<T>;
}

export const api = {
  listIncidents: () => request<Incident[]>("/api/incidents"),
  createIncident: (payload: {
    title: string;
    description: string;
    source?: string;
  }) =>
    request<Incident>("/api/incidents", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getIncident: (id: number) => request<Incident>(`/api/incidents/${id}`),
  extractIncident: (id: number) =>
    request<Ioc[]>(`/api/incidents/${id}/extract`, { method: "POST" }),
  updateIoc: (
    id: number,
    payload: {
      status?: string;
      description?: string;
      confidence?: number;
      attributes?: Record<string, string>;
      attack_technique_ids?: number[];
    },
  ) =>
    request<Ioc>(`/api/iocs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  listAttackTechniques: () =>
    request<AttackTechnique[]>("/api/attack-techniques"),
  listFeeds: () => request<Feed[]>("/api/feeds"),
  createFeed: (payload: {
    name: string;
    incident_id: number;
    ioc_ids: number[];
  }) =>
    request<Feed>("/api/feeds", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getFeed: (id: number) => request<Feed>(`/api/feeds/${id}`),
  getFeedStix: (id: number) =>
    request<{ bundle: StixBundle; saved_path: string }>(
      `/api/feeds/${id}/stix`,
    ),
  exportFeed: (id: number) =>
    request<{ bundle: StixBundle; saved_path: string }>(
      `/api/feeds/${id}/export/stix`,
    ),
};
