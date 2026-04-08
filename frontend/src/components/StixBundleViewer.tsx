import { Stix2Visualizer } from "@aarpaardev/stix-visualizer";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { StixBundle } from "../types/stix";
import { normalizeStixBundle, summarizeStixBundle } from "../utils/stix";

interface Props {
  bundle: StixBundle | null;
  loading?: boolean;
  error?: string | null;
}

export function StixBundleViewer({ bundle, loading = false, error = null }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    const syncWidth = () => {
      setWidth(Math.max(node.clientWidth - 2, 320));
    };

    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return <Alert severity="info">Preparing STIX graph...</Alert>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!bundle) {
    return (
      <Alert severity="info" icon={<InfoOutlinedIcon />}>
        Export a feed to inspect the STIX graph and the raw bundle JSON.
      </Alert>
    );
  }

  try {
    const normalizedBundle = normalizeStixBundle(bundle);
    const summary = summarizeStixBundle(normalizedBundle);

    return (
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip icon={<HubOutlinedIcon />} label={`Objects: ${summary.totalObjects}`} color="primary" variant="outlined" />
          <Chip label={`Indicators: ${summary.indicators}`} variant="outlined" />
          <Chip label={`ATT&CK nodes: ${summary.attackPatterns}`} variant="outlined" />
          <Chip label={`Relationships: ${summary.relationships}`} variant="outlined" />
        </Stack>

        <Paper
          variant="outlined"
          ref={containerRef}
          sx={{
            p: 1.5,
            minHeight: 560,
            overflow: "hidden",
            background:
              "radial-gradient(circle at top, rgba(125, 211, 252, 0.08), transparent 35%), rgba(6, 16, 27, 0.9)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1.5, px: 1, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="h6">STIX Graph</Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive view of exported objects and their relationships.
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Drag nodes, zoom the canvas, and use the legend to filter report noise.
            </Typography>
          </Box>

          {summary.totalObjects === 0 ? (
            <Alert severity="warning" icon={<WarningAmberOutlinedIcon />}>
              The bundle is valid, but it does not contain any STIX objects to render.
            </Alert>
          ) : (
            <Box sx={{ height: 500, borderRadius: 2, overflow: "hidden" }}>
              {width > 0 && (
                <Stix2Visualizer
                  data={normalizedBundle}
                  width={width}
                  height={500}
                  noiseOptions={{ ignoreReportObjectRefs: true }}
                  legendOptions={{
                    display: true,
                    position: "bottom-left",
                    containerStyle: {
                      background: "rgba(9, 17, 31, 0.9)",
                      border: "1px solid rgba(125, 211, 252, 0.16)",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      padding: "10px 12px",
                    },
                    displayignoreReportObjectRefsCheckBox: true,
                  }}
                  nodeOptions={{
                    size: 14,
                    disableZoomOnClick: false,
                  }}
                  linkOptions={{
                    distance: 110,
                    curvature: 0.18,
                    color: "rgba(125, 211, 252, 0.35)",
                  }}
                  directionOptions={{
                    displayDirections: true,
                    displayParticles: false,
                    directionSize: 4,
                    directionalParticles: 0,
                    directionalParticlesAndArrowColor: "rgba(245, 158, 11, 0.9)",
                  }}
                  nodeLabelOptions={{
                    display: true,
                    fontSize: 6,
                    color: "rgba(226, 232, 240, 0.95)",
                    onZoomOutDisplay: false,
                    backgroundColor: "rgba(9, 17, 31, 0.75)",
                  }}
                  linkLabelOptions={{
                    display: true,
                    fontSize: 4,
                    color: "rgba(148, 163, 184, 0.9)",
                    onZoomOutDisplay: false,
                    backgroundColor: "rgba(9, 17, 31, 0.75)",
                  }}
                />
              )}
            </Box>
          )}
        </Paper>
      </Stack>
    );
  } catch (viewerError) {
    const message = viewerError instanceof Error ? viewerError.message : "Unknown STIX parsing error.";
    return <Alert severity="error">Unable to render STIX graph: {message}</Alert>;
  }
}
