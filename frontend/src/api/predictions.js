import client from "./client";

export const getLatestPrediction = (stationId) =>
  client.get(`/predictions/latest/${stationId}`).then((r) => r.data);

export const getPredictionHistory = (stationId) =>
  client.get(`/predictions/history/${stationId}`).then((r) => r.data);
