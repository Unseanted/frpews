import client from "./client";

export const getLatestPrediction = (stationId) =>
  client.get(`/predictions/latest/${Number(stationId)}`).then((r) => r.data);

export const getPredictionHistory = (stationId) =>
  client.get(`/predictions/history/${Number(stationId)}`).then((r) => r.data);
