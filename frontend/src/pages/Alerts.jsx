import { useEffect, useState } from "react";
import Waterline from "@/components/Waterline";
import PageHeader from "@/components/PageHeader";
import { listAlerts } from "@/api/alerts";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BellRing, Smartphone, Mail, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    listAlerts()
      .then((data) => {
        setAlerts(data);
        setStatus(data.length ? "ready" : "empty");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administrator Logs"
        eyebrowIcon={BellRing}
        title="System Alert Log"
        description="Comprehensive log of SMS and dashboard alert notifications dispatched during High or Extreme risk advisories."
      />

      <Waterline />

      {status === "loading" && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Could Not Fetch Alert Logs</AlertTitle>
          <AlertDescription>
            Ensure you have administrative privileges and the backend API service is online.
          </AlertDescription>
        </Alert>
      )}

      {status === "empty" && (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <ShieldCheck className="mb-2 size-8 text-primary" />
            <CardTitle>No Alerts Recorded</CardTitle>
            <CardDescription>
              No emergency advisories or SMS notifications have been triggered yet.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {status === "ready" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sent Time</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Delivery Status</TableHead>
                <TableHead className="w-[40%]">Advisory Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((a) => {
                const MediumIcon = a.medium?.toLowerCase() === "sms" ? Smartphone : Mail;
                const isDelivered =
                  a.delivery_status?.toLowerCase() === "delivered" ||
                  a.delivery_status?.toLowerCase() === "sent";

                return (
                  <TableRow key={a.alert_id}>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {new Date(a.sent_time).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <MediumIcon className="size-3.5 text-primary" />
                        <span className="uppercase">{a.medium}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.recipient}</TableCell>
                    <TableCell>
                      <Badge variant={isDelivered ? "low" : "high"} className="capitalize">
                        {a.delivery_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal text-xs leading-relaxed">
                      {a.message}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
