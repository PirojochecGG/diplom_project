import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { appColors } from "../theme/theme";
import { Feed, Incident } from "../types/api";
import { StixBundle } from "../types/stix";

interface Props {
  incidents: Incident[];
  feeds: Feed[];
  selectedIncidentId: number | null;
  selectedFeedId: number | null;
  stixBundle: StixBundle | null;
  savedPath: string | null;
  onSelectIncident: (id: number) => void;
  onSelectFeed: (id: number) => void;
  onCreateFeed: (payload: {
    name: string;
    incident_id: number;
    ioc_ids: number[];
  }) => Promise<void>;
  onExportFeed: (id: number) => Promise<void>;
}

const FEED_JSON_PREVIEW_MAX_HEIGHT = 420;

const feedJsonPreviewSx = {
  maxHeight: FEED_JSON_PREVIEW_MAX_HEIGHT,
  overflow: "auto",
  scrollbarColor: `${appColors.secondary} ${appColors.surfaceElevated}`,
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": {
    width: 10,
    height: 10,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: appColors.surfaceElevated,
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: appColors.secondary,
    border: `2px solid ${appColors.surfaceElevated}`,
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: appColors.primary,
  },
  "&::-webkit-scrollbar-corner": {
    backgroundColor: appColors.surfaceElevated,
  },
};

const feedJsonPaperSx = {
  p: 2,
  backgroundColor: appColors.surfaceMuted,
};

export function FeedsPage({
  incidents,
  feeds,
  selectedIncidentId,
  selectedFeedId,
  stixBundle,
  savedPath,
  onSelectIncident,
  onSelectFeed,
  onCreateFeed,
  onExportFeed,
}: Props) {
  const [feedName, setFeedName] = useState("");
  const selectedIncident =
    incidents.find((item) => item.id === selectedIncidentId) ?? null;
  const confirmedIocs =
    selectedIncident?.iocs.filter((item) => item.status === "confirmed") ?? [];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Feed export</Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            select
            label="Incident"
            value={selectedIncidentId ?? ""}
            onChange={(event) => onSelectIncident(Number(event.target.value))}
          >
            {incidents.map((incident) => (
              <MenuItem key={incident.id} value={incident.id}>
                {incident.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Feed name"
            value={feedName}
            onChange={(event) => setFeedName(event.target.value)}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography color="text.secondary">
              {selectedIncident
                ? `Confirmed IoCs available for feed: ${confirmedIocs.length}`
                : "Select incident with reviewed IoCs."}
            </Typography>
            <Button
              variant="contained"
              onClick={() =>
                selectedIncident &&
                onCreateFeed({
                  name: feedName || `${selectedIncident.title} feed`,
                  incident_id: selectedIncident.id,
                  ioc_ids: confirmedIocs.map((item) => item.id),
                })
              }
              disabled={!selectedIncident || confirmedIocs.length === 0}
            >
              Create feed
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            select
            label="Feed"
            value={selectedFeedId ?? ""}
            onChange={(event) => onSelectFeed(Number(event.target.value))}
          >
            {feeds.map((feed) => (
              <MenuItem key={feed.id} value={feed.id}>
                {feed.name}
              </MenuItem>
            ))}
          </TextField>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography color="text.secondary">
              {selectedFeedId
                ? "Export the selected feed to STIX 2.1 bundle."
                : "Choose a feed to preview JSON export."}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              onClick={() => selectedFeedId && onExportFeed(selectedFeedId)}
              disabled={!selectedFeedId}
            >
              Export STIX JSON
            </Button>
          </Box>
          {savedPath && (
            <Alert severity="success">JSON saved to: {savedPath}</Alert>
          )}
          {!stixBundle && (
            <Alert severity="info">
              Exported JSON will appear here for demo and verification.
            </Alert>
          )}
          {stixBundle && (
            <Paper variant="outlined" sx={feedJsonPaperSx}>
              <Box sx={feedJsonPreviewSx}>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {JSON.stringify(stixBundle, null, 2)}
                </pre>
              </Box>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
