import { Alert, Grid2, Paper, Stack, Typography } from "@mui/material";
import { Feed, Incident } from "../types/api";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4">{value}</Typography>
    </Paper>
  );
}

export function DashboardPage({
  incidents,
  feeds,
}: {
  incidents: Incident[];
  feeds: Feed[];
}) {
  const iocs = incidents.flatMap((incident) => incident.iocs);

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Operational overview</Typography>

      </div>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <StatCard label="Incidents" value={incidents.length} />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <StatCard label="IoCs" value={iocs.length} />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <StatCard label="Feeds" value={feeds.length} />
        </Grid2>
      </Grid2>
      <Alert severity="info" sx={{ alignItems: "center" }}>
        For the demo workflow: create an incident, run extraction, confirm the
        indicators, and build a feed.
      </Alert>
    </Stack>
  );
}
