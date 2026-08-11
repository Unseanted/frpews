import client from "./client";

export const listStations = () => client.get("/stations").then((r) => r.data);
export const getStation = (id) => client.get(`/stations/${id}`).then((r) => r.data);
