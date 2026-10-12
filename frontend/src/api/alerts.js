import client from "./client";

export const listAlerts = () => client.get("/alerts").then((r) => r.data);

export const sendManualAlert = (payload) =>
  client
    .post("/alerts/send-manual", {
      ...payload,
      prediction_id: Number(payload.prediction_id),
    })
    .then((r) => r.data);

export const subscribe = (stationId) =>
  client
    .post("/alerts/subscribe", { station_id: Number(stationId) })
    .then((r) => r.data);
