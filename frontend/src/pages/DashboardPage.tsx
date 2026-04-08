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

export function DashboardPage({ incidents, feeds }: { incidents: Incident[]; feeds: Feed[] }) {
  const iocs = incidents.flatMap((incident) => incident.iocs);

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Operational overview</Typography>
        <Typography color="text.secondary">
          Минимальная витрина для практической части: события, извлеченные IoC, ATT&CK и экспорт feed в STIX.
        </Typography>
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
        Для демо-сценария: создайте инцидент, запустите extraction, подтвердите индикаторы и соберите feed.
      </Alert>
    </Stack>
  );
}
