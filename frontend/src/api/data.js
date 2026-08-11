import client from "./client";

export const getHistory = (stationId, days = 7) =>
  client.get(`/data/history/${stationId}`, { params: { days } }).then((r) => r.data);

export const submitEntry = (payload) =>
  client.post("/data/entry", payload).then((r) => r.data);

export const uploadCsv = (file) => {
  const form = new FormData();
  form.append("file", file);
  return client.post("/data/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
