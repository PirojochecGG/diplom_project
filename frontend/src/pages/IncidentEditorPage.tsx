import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
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
import { FormEvent, useState } from "react";
import { Incident } from "../types/api";

interface Props {
  incidents: Incident[];
  selectedIncidentId: number | null;
  onSelectIncident: (id: number) => void;
  onCreateIncident: (payload: {
    title: string;
    description: string;
    source?: string;
  }) => Promise<void>;
  onExtract: (id: number) => Promise<void>;
}

export function IncidentEditorPage({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onCreateIncident,
  onExtract,
}: Props) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedIncident =
    incidents.find((item) => item.id === selectedIncidentId) ?? null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await onCreateIncident({
        title,
        description,
        source: source || undefined,
      });
      setTitle("");
      setSource("");
      setDescription("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Incident editor</Typography>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <TextField
            label="Source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
          <TextField
            label="Incident description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            multiline
            minRows={8}
            placeholder="Paste incident narrative, email text, or analyst summary here..."
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={busy}>
              Save incident
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            select
            label="Selected incident"
            value={selectedIncidentId ?? ""}
            onChange={(event) => onSelectIncident(Number(event.target.value))}
          >
            {incidents.map((incident) => (
              <MenuItem key={incident.id} value={incident.id}>
                {incident.title}
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
              {selectedIncident
                ? `${selectedIncident.iocs.length} IoCs currently attached to the incident.`
                : "Choose an incident to extract IoCs."}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PlayArrowOutlinedIcon />}
              onClick={() =>
                selectedIncidentId && onExtract(selectedIncidentId)
              }
              disabled={!selectedIncidentId}
            >
              Run extraction
            </Button>
          </Box>
          {selectedIncident && (
            <Alert severity="info">
              Source: {selectedIncident.source || "not specified"}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
