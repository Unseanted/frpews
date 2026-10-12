import client from "./client";

export const listStations = () => client.get("/stations").then((r) => r.data);
export const getStation = (id) =>
  client.get(`/stations/${Number(id)}`).then((r) => r.data);
