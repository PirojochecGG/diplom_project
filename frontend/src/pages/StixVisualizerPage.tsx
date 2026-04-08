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
  stixBundle: StixBundle | null;
  savedPath: string | null;
  onSelectFeed: (id: number) => void;
  onExportFeed: (id: number) => Promise<void>;
}

export function StixVisualizerPage({
  feeds,
  selectedFeedId,
  stixBundle,
  savedPath,
  onSelectFeed,
  onExportFeed,
}: Props) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">STIX Visualizer</Typography>
        <Typography color="text.secondary">
          Separate workspace for graph inspection of exported STIX bundles.
        </Typography>
      </Box>

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

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography color="text.secondary">
              {selectedFeedId
                ? "Generate or refresh the STIX bundle for the selected feed before rendering the graph."
                : "Choose a feed to render its STIX bundle."}
            </Typography>
            <Button
              variant="contained"
              startIcon={<InsightsOutlinedIcon />}
              onClick={() => selectedFeedId && onExportFeed(selectedFeedId)}
              disabled={!selectedFeedId}
            >
              Render STIX Graph
            </Button>
          </Box>

          {savedPath && (
            <Alert severity="success" icon={<DownloadOutlinedIcon />}>
              Latest bundle saved to: {savedPath}
            </Alert>
          )}

          <StixBundleViewer bundle={stixBundle} />
        </Stack>
      </Paper>
    </Stack>
  );
}
