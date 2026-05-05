import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
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
import { StixBundleViewer } from "../components/StixBundleViewer";
import { Feed } from "../types/api";
import { StixBundle } from "../types/stix";

interface Props {
  feeds: Feed[];
  selectedFeedId: number | null;
  loading: boolean;
  error: string | null;
  stixBundle: StixBundle | null;
  savedPath: string | null;
  onSelectFeed: (id: number) => void;
  onLoadFeedStix: (id: number) => Promise<void>;
}

export function StixVisualizerPage({
  feeds,
  selectedFeedId,
  loading,
  error,
  stixBundle,
  savedPath,
  onSelectFeed,
  onLoadFeedStix,
}: Props) {
  const selectedFeed = feeds.find((feed) => feed.id === selectedFeedId) ?? null;
  const hasSavedBundle = Boolean(selectedFeed?.stix_bundle_path);

  return (
    <Stack spacing={3} sx={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
      <Box>
        <Typography variant="h4">STIX Visualizer</Typography>
        <Typography color="text.secondary">
          Separate workspace for graph inspection of exported STIX bundles.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
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
              {!selectedFeed
                ? "Choose a feed to render its previously exported STIX bundle."
                : hasSavedBundle
                  ? "Load the saved STIX bundle for the selected feed."
                  : "This feed has no saved STIX bundle yet. Export it on the feeds page first."}
            </Typography>
            <Button
              variant="contained"
              startIcon={<InsightsOutlinedIcon />}
              onClick={() => selectedFeedId && onLoadFeedStix(selectedFeedId)}
              disabled={!selectedFeedId || !hasSavedBundle || loading}
            >
              Visualize
            </Button>
          </Box>

          {!selectedFeed && (
            <Alert severity="info">
              Select a feed to load an already exported STIX bundle.
            </Alert>
          )}

          {selectedFeed && !hasSavedBundle && (
            <Alert severity="warning">
              No saved STIX bundle found for this feed. Go to Feed export and
              run `Export STIX JSON` first.
            </Alert>
          )}

          {savedPath && (
            <Alert severity="success" icon={<DownloadOutlinedIcon />}>
              Loaded bundle from: {savedPath}
            </Alert>
          )}

          <StixBundleViewer
            bundle={stixBundle}
            loading={loading}
            error={error}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
