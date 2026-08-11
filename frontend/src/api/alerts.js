import client from "./client";

export const listAlerts = () => client.get("/alerts").then((r) => r.data);

export const sendManualAlert = (payload) =>
  client.post("/alerts/send-manual", payload).then((r) => r.data);

export const subscribe = (stationId) =>
  client.post("/alerts/subscribe", { station_id: stationId }).then((r) => r.data);
