import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { api } from "./api/client";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { FeedsPage } from "./pages/FeedsPage";
import { IncidentEditorPage } from "./pages/IncidentEditorPage";
import { ReviewPage } from "./pages/ReviewPage";
import { StixVisualizerPage } from "./pages/StixVisualizerPage";
import { AttackTechnique, Feed, Incident, IocStatus } from "./types/api";
import { StixBundle } from "./types/stix";

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [techniques, setTechniques] = useState<AttackTechnique[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [stixBundle, setStixBundle] = useState<StixBundle | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAll() {
    const [incidentData, feedData, techniqueData] = await Promise.all([
      api.listIncidents(),
      api.listFeeds(),
      api.listAttackTechniques(),
    ]);
    setIncidents(incidentData);
    setFeeds(feedData);
    setTechniques(techniqueData);
    setSelectedIncidentId((current) => current ?? incidentData[0]?.id ?? null);
    setSelectedFeedId((current) => current ?? feedData[0]?.id ?? null);
  }

  useEffect(() => {
    void loadAll().catch((error: Error) => setMessage(error.message));
  }, []);

  async function handleCreateIncident(payload: { title: string; description: string; source?: string }) {
    await api.createIncident(payload);
    await loadAll();
    setMessage("Incident created");
  }

  async function handleExtract(incidentId: number) {
    await api.extractIncident(incidentId);
    await loadAll();
    setMessage("Extraction completed");
  }

  async function handleSaveAllIocs(
    payload: Array<{
      id: number;
      status: IocStatus;
      description: string;
      confidence: number;
      attack_technique_ids: number[];
    }>,
  ) {
    await Promise.all(
      payload.map((item) =>
        api.updateIoc(item.id, {
          status: item.status,
          description: item.description,
          confidence: item.confidence,
          attack_technique_ids: item.attack_technique_ids,
        }),
      ),
    );
    await loadAll();
    setMessage("IoCs updated");
  }

  async function handleCreateFeed(payload: { name: string; incident_id: number; ioc_ids: number[] }) {
    const feed = await api.createFeed(payload);
    await loadAll();
    setSelectedFeedId(feed.id);
    setMessage("Feed created");
  }

  async function handleExportFeed(feedId: number) {
    const response = await api.exportFeed(feedId);
    setStixBundle(response.bundle);
    setSavedPath(response.saved_path);
    setMessage("STIX bundle generated");
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage incidents={incidents} feeds={feeds} />} />
        <Route
          path="/incidents"
          element={
            <IncidentEditorPage
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={setSelectedIncidentId}
              onCreateIncident={handleCreateIncident}
              onExtract={handleExtract}
            />
          }
        />
        <Route
          path="/review"
          element={
            <ReviewPage
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              techniques={techniques}
              onSelectIncident={setSelectedIncidentId}
              onSaveAll={handleSaveAllIocs}
            />
          }
        />
        <Route
          path="/feeds"
          element={
            <FeedsPage
              incidents={incidents}
              feeds={feeds}
              selectedIncidentId={selectedIncidentId}
              selectedFeedId={selectedFeedId}
              stixBundle={stixBundle}
              savedPath={savedPath}
              onSelectIncident={setSelectedIncidentId}
              onSelectFeed={setSelectedFeedId}
              onCreateFeed={handleCreateFeed}
              onExportFeed={handleExportFeed}
            />
          }
        />
        <Route
          path="/stix-visualizer"
          element={
            <StixVisualizerPage
              feeds={feeds}
              selectedFeedId={selectedFeedId}
              stixBundle={stixBundle}
              savedPath={savedPath}
              onSelectFeed={setSelectedFeedId}
              onExportFeed={handleExportFeed}
            />
          }
        />
      </Routes>
      <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage(null)}>
        <Alert severity="success" onClose={() => setMessage(null)} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
