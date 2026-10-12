import client from "./client";

const NUMERIC_FIELDS = [
  "daily_rainfall_mm",
  "temp_max_c",
  "relative_humidity_pct",
  "river_level_m",
  "flow_rate_m3s",
  "ndvi",
];

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export const getHistory = (stationId, days = 7) =>
  client
    .get(`/data/history/${Number(stationId)}`, { params: { days } })
    .then((r) => r.data);

export const submitEntry = (payload) => {
  const body = {
    ...payload,
    station_id: Number(payload.station_id),
  };
  for (const key of NUMERIC_FIELDS) {
    if (key in body) body[key] = toNumberOrNull(body[key]);
  }
  return client.post("/data/entry", body).then((r) => r.data);
};

export const uploadCsv = (file) => {
  const form = new FormData();
  form.append("file", file);
  return client.post("/data/upload", form).then((r) => r.data);
};
