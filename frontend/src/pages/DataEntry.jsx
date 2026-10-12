import { useEffect, useState } from "react";
import Waterline from "@/components/Waterline";
import PageHeader from "@/components/PageHeader";
import { listStations } from "@/api/stations";
import { submitEntry, uploadCsv } from "@/api/data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, UploadCloud, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";

const EMPTY = {
  station_id: "",
  date: "",
  daily_rainfall_mm: "",
  temp_max_c: "",
  relative_humidity_pct: "",
  river_level_m: "",
  flow_rate_m3s: "",
  ndvi: "",
};

export default function DataEntry() {
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState(null);
  const [file, setFile] = useState(null);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [submittingCsv, setSubmittingCsv] = useState(false);

  useEffect(() => {
    listStations().then(setStations).catch(() => setStations([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmittingManual(true);
    try {
      await submitEntry(form);
      setMessage({ tone: "ok", text: "Observation record saved successfully." });
      setForm(EMPTY);
    } catch (err) {
      const details = err.response?.data?.details;
      const detailText = Array.isArray(details) && details.length ? ` ${details.join(" ")}` : "";
      setMessage({
        tone: "error",
        text: `${err.response?.data?.error || "Could not save this observation record."}${detailText}`,
      });
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setMessage(null);
    setSubmittingCsv(true);
    try {
      const res = await uploadCsv(file);
      setMessage({ tone: "ok", text: res.message });
      setFile(null);
    } catch (err) {
      setMessage({ tone: "error", text: err.response?.data?.error || "CSV upload failed." });
    } finally {
      setSubmittingCsv(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Data Manager Portal"
        eyebrowIcon={FileSpreadsheet}
        title="Field Data Entry"
        description="Log a manual daily hydrographic observation or bulk-upload field CSV records for preprocessing."
      />

      <Waterline />

      {message && (
        <Alert variant={message.tone === "error" ? "destructive" : "default"}>
          {message.tone === "ok" ? <CheckCircle2 /> : <AlertCircle />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="size-4 text-primary" />
              Manual Observation Entry
            </CardTitle>
            <CardDescription>
              Record single daily station readings for live model ingestion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Station</Label>
                  <Select
                    value={form.station_id}
                    onValueChange={(value) => setForm({ ...form, station_id: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select station..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((s) => (
                        <SelectItem key={s.station_id} value={String(s.station_id)}>
                          {s.name} ({s.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["daily_rainfall_mm", "Rainfall (mm)"],
                  ["temp_max_c", "Max Temperature (°C)"],
                  ["relative_humidity_pct", "Relative Humidity (%)"],
                  ["river_level_m", "River Level (m)"],
                  ["flow_rate_m3s", "Flow Rate (m³/s)"],
                  ["ndvi", "NDVI Index"],
                ].map(([key, label]) => (
                  <div className="space-y-2" key={key}>
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={submittingManual} className="w-full">
                {submittingManual ? "Saving record..." : "Save Observation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="size-4 text-primary" />
              Bulk CSV Dataset Upload
            </CardTitle>
            <CardDescription>
              Upload pre-formatted station CSV files matching pipeline schema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:bg-muted/50">
              <UploadCloud className="mx-auto mb-2 size-8 text-primary/70" />
              <p className="mb-1 text-xs font-medium">Select CSV file to ingest</p>
              <p className="mb-4 text-[11px] text-muted-foreground">
                Columns matching preprocessing pipeline requirements.
              </p>
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("csv-file-input").click()}
              >
                Browse Files
              </Button>
              {file && (
                <div className="mx-auto mt-3 max-w-xs truncate rounded-md border bg-card p-2 font-mono text-xs">
                  {file.name}
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || submittingCsv}
              className="w-full"
            >
              {submittingCsv ? "Uploading..." : "Upload CSV"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
