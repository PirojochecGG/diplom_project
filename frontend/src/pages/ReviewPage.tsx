import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { appColors } from "../theme/theme";
import { AttackTechnique, Incident, IocStatus } from "../types/api";

interface Props {
  incidents: Incident[];
  selectedIncidentId: number | null;
  techniques: AttackTechnique[];
  onSelectIncident: (id: number) => void;
  onSaveAll: (
    payload: Array<{
      id: number;
      status: IocStatus;
      description: string;
      confidence: number;
      attack_technique_ids: number[];
    }>,
  ) => Promise<void>;
}

const REVIEW_TABLE_MAX_HEIGHT = 700;

const reviewTableScrollSx = {
  maxHeight: REVIEW_TABLE_MAX_HEIGHT,
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

export function ReviewPage({
  incidents,
  selectedIncidentId,
  techniques,
  onSelectIncident,
  onSaveAll,
}: Props) {
  const incident =
    incidents.find((item) => item.id === selectedIncidentId) ?? null;
  const [isSaving, setIsSaving] = useState(false);
  const [drafts, setDrafts] = useState<
    Record<
      number,
      {
        status: IocStatus;
        description: string;
        confidence: number;
        attackTechniqueIds: number[];
      }
    >
  >({});

  useEffect(() => {
    if (!incident) {
      setDrafts({});
      return;
    }
    const nextDrafts = Object.fromEntries(
      incident.iocs.map((ioc) => [
        ioc.id,
        {
          status: ioc.status,
          description: ioc.description ?? "",
          confidence: ioc.confidence,
          attackTechniqueIds: ioc.attack_techniques.map((item) => item.id),
        },
      ]),
    );
    setDrafts(nextDrafts);
  }, [incident]);

  const dirtyCount = incident
    ? incident.iocs.filter((ioc) => {
        const draft = drafts[ioc.id];
        if (!draft) {
          return false;
        }
        return (
          draft.status !== ioc.status ||
          draft.description !== (ioc.description ?? "") ||
          draft.confidence !== ioc.confidence ||
          draft.attackTechniqueIds.join(",") !==
            ioc.attack_techniques.map((item) => item.id).join(",")
        );
      }).length
    : 0;

  async function handleSaveAll() {
    if (!incident) {
      return;
    }
    setIsSaving(true);
    try {
      await onSaveAll(
        incident.iocs.map((ioc) => {
          const draft = drafts[ioc.id];
          return {
            id: ioc.id,
            status: draft.status,
            description: draft.description,
            confidence: draft.confidence,
            attack_technique_ids: draft.attackTechniqueIds,
          };
        }),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">IoC review</Typography>
      <TextField
        select
        label="Incident"
        value={selectedIncidentId ?? ""}
        onChange={(event) => onSelectIncident(Number(event.target.value))}
      >
        {incidents.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.title}
          </MenuItem>
        ))}
      </TextField>
      {!incident && (
        <Alert severity="info">
          Create or select an incident to review extracted indicators.
        </Alert>
      )}
      {incident && (
        <Paper sx={{ overflow: "auto", p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography color="text.secondary">
                {dirtyCount > 0
                  ? `Unsaved changes: ${dirtyCount}`
                  : "No unsaved changes"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={isSaving || dirtyCount === 0}
                onClick={() => void handleSaveAll()}
              >
                Save
              </Button>
            </Stack>
            <TableContainer sx={reviewTableScrollSx}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>ATT&CK</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incident.iocs.map((ioc) => (
                    <TableRow key={ioc.id}>
                      <TableCell>
                        <Chip size="small" label={ioc.type} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        {ioc.normalized_value}
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={drafts[ioc.id]?.status ?? ioc.status}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [ioc.id]: {
                                ...(current[ioc.id] ?? {
                                  status: ioc.status,
                                  description: ioc.description ?? "",
                                  confidence: ioc.confidence,
                                  attackTechniqueIds:
                                    ioc.attack_techniques.map(
                                      (item) => item.id,
                                    ),
                                }),
                                status: event.target.value as IocStatus,
                              },
                            }))
                          }
                        >
                          <MenuItem value="candidate">candidate</MenuItem>
                          <MenuItem value="confirmed">confirmed</MenuItem>
                          <MenuItem value="rejected">rejected</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={drafts[ioc.id]?.confidence ?? ioc.confidence}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [ioc.id]: {
                                ...(current[ioc.id] ?? {
                                  status: ioc.status,
                                  description: ioc.description ?? "",
                                  confidence: ioc.confidence,
                                  attackTechniqueIds:
                                    ioc.attack_techniques.map(
                                      (item) => item.id,
                                    ),
                                }),
                                confidence: Number(event.target.value),
                              },
                            }))
                          }
                          inputProps={{ min: 0, max: 1, step: 0.05 }}
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={
                            drafts[ioc.id]?.description ??
                            ioc.description ??
                            ""
                          }
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [ioc.id]: {
                                ...(current[ioc.id] ?? {
                                  status: ioc.status,
                                  description: ioc.description ?? "",
                                  confidence: ioc.confidence,
                                  attackTechniqueIds:
                                    ioc.attack_techniques.map(
                                      (item) => item.id,
                                    ),
                                }),
                                description: event.target.value,
                              },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 280 }}>
                        <Autocomplete
                          multiple
                          options={techniques}
                          value={techniques.filter((item) =>
                            (drafts[ioc.id]?.attackTechniqueIds ?? []).includes(
                              item.id,
                            ),
                          )}
                          getOptionLabel={(option) =>
                            `${option.attack_id} ${option.technique_name}`
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Select techniques"
                            />
                          )}
                          onChange={(_, values) =>
                            setDrafts((current) => ({
                              ...current,
                              [ioc.id]: {
                                ...(current[ioc.id] ?? {
                                  status: ioc.status,
                                  description: ioc.description ?? "",
                                  confidence: ioc.confidence,
                                  attackTechniqueIds:
                                    ioc.attack_techniques.map(
                                      (item) => item.id,
                                    ),
                                }),
                                attackTechniqueIds: values.map(
                                  (item) => item.id,
                                ),
                              },
                            }))
                          }
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                key={option.id}
                                size="small"
                                label={option.attack_id}
                              />
                            ))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
