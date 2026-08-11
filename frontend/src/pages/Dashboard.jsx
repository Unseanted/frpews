import { useEffect, useState } from "react";
import Waterline from "@/components/Waterline";
import RiskCard from "@/components/RiskCard";
import PageHeader from "@/components/PageHeader";
import { listStations } from "@/api/stations";
import { getLatestPrediction } from "@/api/predictions";
import { getHistory } from "@/api/data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [stations, setStations] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [trends, setTrends] = useState({});
  const [status, setStatus] = useState("loading");

  const loadDashboardData = () => {
    setStatus("loading");
    listStations()
      .then(async (list) => {
        setStations(list);
        setStatus(list.length ? "ready" : "empty");

        list.forEach((s) => {
          getLatestPrediction(s.station_id)
            .then((p) => setPredictions((prev) => ({ ...prev, [s.station_id]: p })))
            .catch(() => {});
          getHistory(s.station_id, 7)
            .then((records) =>
              setTrends((prev) => ({
                ...prev,
                [s.station_id]: records.map((r) => r.river_level_m || 0),
              }))
            )
            .catch(() => {});
        });
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Live Monitoring — 3 Study Areas"
        eyebrowIcon={Activity}
        title="Flood Risk Dashboard"
        description="Real-time hydrographic conditions for Makurdi, Onitsha and Lokoja, refreshed every 6 hours from the RF + LSTM ensemble model."
        action={
          <Button variant="outline" size="sm" onClick={loadDashboardData} className="gap-2">
            <RefreshCw className="size-3.5" />
            Refresh Feed
          </Button>
        }
      />

      <Waterline />

      {status === "loading" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      )}

      {status === "empty" && (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Radio className="size-6" />
            </div>
            <CardTitle>No Monitoring Stations Configured</CardTitle>
            <CardDescription className="max-w-md">
              Seed the database using schema.sql, or register a new monitoring station from the Admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Backend API Unavailable</AlertTitle>
          <AlertDescription>
            Could not establish connection with the Flask backend API. Please ensure the backend server is running on the configured API base URL.
          </AlertDescription>
        </Alert>
      )}

      {status === "ready" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stations.map((s) => (
            <RiskCard
              key={s.station_id}
              station={s}
              prediction={predictions[s.station_id]}
              trendValues={trends[s.station_id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
