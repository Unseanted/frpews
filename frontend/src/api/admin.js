import client from "./client";

export const getStatus = () => client.get("/admin/status").then((r) => r.data);

export const retrain = () => client.post("/admin/retrain").then((r) => r.data);
