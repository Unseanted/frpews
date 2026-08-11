import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import BrandMark from "@/components/BrandMark";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Lock, Mail, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Sign-in authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="glass-card shadow-cardHover ring-1 ring-foreground/5">
        <CardHeader className="items-center space-y-4 pb-2 text-center">
          <BrandMark />
          <div className="space-y-1">
            <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
              Sign in to FRPEWS
            </CardTitle>
            <CardDescription>
              Flood Risk Prediction & Early Warning System Portal
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="operator@frpews.gov.ng"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2">
              <LogIn className="size-4" />
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
