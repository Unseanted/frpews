import { useEffect, useState } from "react";
import Waterline from "../components/Waterline";
import client from "../api/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ShieldAlert, Radio, FileText, Cpu, Bell, RefreshCw, CheckCircle2 } from "lucide-react";

export default function Admin() {
  const [statusData, setStatusData] = useState(null);
  const [retrainMsg, setRetrainMsg] = useState("");
  const [retraining, setRetraining] = useState(false);

  useEffect(() => {
    client.get("/admin/status").then((r) => setStatusData(r.data)).catch(() => {});
  }, []);

  const retrain = () => {
    setRetraining(true);
    setRetrainMsg("");
    client
      .post("/admin/retrain")
      .then((r) => setRetrainMsg(r.data.message))
      .catch((err) => setRetrainMsg(err.response?.data?.error || "Retraining request failed."))
      .finally(() => setRetraining(false));
  };

  const stats = [
    { label: "Monitoring Stations", value: statusData?.stations, icon: Radio, color: "text-river-600" },
    { label: "Environmental Records", value: statusData?.environmental_records, icon: FileText, color: "text-amber-600" },
    { label: "Predictions Logged", value: statusData?.predictions, icon: Cpu, color: "text-emerald-600" },
    { label: "Alerts Sent", value: statusData?.alerts_sent, icon: Bell, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-river-50 text-river-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-river-100">
          <ShieldAlert className="w-3.5 h-3.5" />
          System Operators
        </div>
        <h1 className="text-3xl font-extrabold text-river-900 tracking-tight">
          System Administration
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-medium">
          Data ingestion metrics, station status, and machine learning model retraining controls.
        </p>
      </div>

      <Waterline />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-3xl font-extrabold font-mono text-river-950 mt-3">
                {s.value ?? "—"}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Model Retraining Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-river-600" />
            Model Pipeline Retraining
          </CardTitle>
          <CardDescription>
            Re-evaluate and retrain the Random Forest and LSTM ensemble models against newly ingested environmental datasets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Retraining executes feature engineering and re-fits the dual-stage predictive pipeline. In production, this trigger should be queued via a asynchronous background worker task.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              onClick={retrain}
              disabled={retraining}
              className="bg-river-600 hover:bg-river-700 text-white gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${retraining ? "animate-spin" : ""}`} />
              {retraining ? "Triggering..." : "Trigger Model Retraining"}
            </Button>

            {retrainMsg && (
              <div className="flex items-center gap-2 text-xs font-semibold text-river-700 bg-river-50 px-3 py-2 rounded-lg border border-river-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{retrainMsg}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
