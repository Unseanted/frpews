import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Waterline from "@/components/Waterline";
import { getStation } from "@/api/stations";
import { getLatestPrediction } from "@/api/predictions";
import { getHistory } from "@/api/data";
import { subscribe } from "@/api/alerts";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { ArrowLeft, Bell, CheckCircle2, Waves, CloudRain, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_PROGRESS_COLORS = {
  Low: "bg-emerald-500",
  Moderate: "bg-amber-500",
  High: "bg-orange-500",
  Extreme: "bg-red-600",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover/95 p-3 text-xs shadow-lg backdrop-blur-md">
        <p className="mb-1 border-b border-border/50 pb-1 font-semibold text-foreground">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function LocationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [subscribeMsg, setSubscribeMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getStation(id).then(setStation);
    getLatestPrediction(id).catch(() => null).then(setPrediction);
    getHistory(id, 7).then(setHistory);
  }, [id]);

  const probs = prediction?.ensemble_probabilities || {};

  const handleSubscribe = () => {
    setSubmitting(true);
    subscribe(id)
      .then(() => setSubscribeMsg("Subscribed to SMS emergency alerts for this station."))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 gap-1.5 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <MapPin className="size-3.5" />
              {station?.state || "State"} Region
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              {station?.name || "Loading station..."}
            </h1>
            <p className="text-sm text-muted-foreground">
              7-day hydrographic trend, ensemble model risk breakdown, and alert preferences.
            </p>
          </div>

          {prediction?.predicted_risk_class && (
            <Badge
              variant={prediction.predicted_risk_class.toLowerCase()}
              className="self-start px-4 py-1 text-sm capitalize sm:self-auto"
            >
              {prediction.predicted_risk_class} Risk
            </Badge>
          )}
        </div>
      </div>

      <Waterline />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Waves className="size-4 text-primary" />
              7-Day Water Level & Rainfall Trend
            </CardTitle>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                River level (m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                Rainfall (mm)
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.012 195)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.52 0.025 205)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.025 205)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="river_level_m"
                  stroke="oklch(0.46 0.09 205)"
                  strokeWidth={2.5}
                  name="River Level (m)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="daily_rainfall_mm"
                  stroke="oklch(0.72 0.14 75)"
                  strokeWidth={2.5}
                  name="Daily Rainfall (mm)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="size-4 text-primary" />
              Risk Probability Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.keys(probs).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No ensemble prediction data recorded for this station yet.
              </p>
            ) : (
              Object.entries(probs).map(([risk, p]) => {
                const percentage = Math.round(p * 100);
                return (
                  <div key={risk} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="capitalize">{risk} Risk</span>
                      <span className="font-mono text-muted-foreground">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="gap-0">
                      <ProgressTrack className="h-2">
                        <ProgressIndicator
                          className={cn("h-full", RISK_PROGRESS_COLORS[risk] || "bg-primary")}
                        />
                      </ProgressTrack>
                    </Progress>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              SMS Alert Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Receive instant automated SMS notifications whenever the ensemble model triggers High or Extreme risk advisories for {station?.name || "this location"}.
            </p>

            {user ? (
              <Button onClick={handleSubscribe} disabled={submitting} className="w-full gap-2">
                <Bell className="size-4" />
                {submitting ? "Subscribing..." : "Subscribe to SMS Alerts"}
              </Button>
            ) : (
              <div className="rounded-lg border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
                <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                to subscribe to SMS emergency alerts.
              </div>
            )}

            {subscribeMsg && (
              <Alert>
                <CheckCircle2 />
                <AlertDescription>{subscribeMsg}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
