import { Link } from "react-router-dom";
import Sparkline from "./Sparkline";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, MapPin, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_BADGE_VARIANTS = {
  Low: "low",
  Moderate: "moderate",
  High: "high",
  Extreme: "extreme",
};

const RISK_COLORS = {
  Low: "var(--risk-low)",
  Moderate: "var(--risk-moderate)",
  High: "var(--risk-high)",
  Extreme: "var(--risk-extreme)",
};

const RISK_BORDER = {
  Low: "group-hover:ring-emerald-200/60",
  Moderate: "group-hover:ring-amber-200/60",
  High: "group-hover:ring-orange-200/60",
  Extreme: "group-hover:ring-red-200/60",
};

export default function RiskCard({ station, prediction, trendValues = [] }) {
  const risk = prediction?.predicted_risk_class || "Low";
  const timestamp = prediction?.prediction_timestamp
    ? new Date(prediction.prediction_timestamp).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No prediction yet";

  const trend = prediction?.risk_trend || "stable";

  const TrendIcon =
    trend === "increasing" ? TrendingUp : trend === "decreasing" ? TrendingDown : Minus;

  const variantKey = RISK_BADGE_VARIANTS[risk] || "low";
  const strokeColor = RISK_COLORS[risk] || "var(--primary)";

  return (
    <Link to={`/locations/${station.station_id}`} className="group block focus:outline-none">
      <Card
        className={cn(
          "h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover",
          RISK_BORDER[risk] || "group-hover:ring-primary/20"
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
              {station.name}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {station.state}
            </p>
          </div>
          <Badge variant={variantKey} className="capitalize">
            {risk}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <Sparkline values={trendValues} color={strokeColor} />

          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="size-3" />
              {timestamp}
            </span>
            <span className="flex items-center gap-1 capitalize font-medium text-foreground">
              <TrendIcon
                className={cn(
                  "size-3.5",
                  trend === "increasing" && "text-amber-600",
                  trend === "decreasing" && "text-emerald-600",
                  trend === "stable" && "text-muted-foreground"
                )}
              />
              {trend}
            </span>
          </div>

          <div className="flex items-center justify-end text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View details
            <ChevronRight className="ml-0.5 size-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
