"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, AlertCircle, CheckCircle2, Loader2, Download, XCircle } from "lucide-react";

type ImportResult = {
  success?: number;
  failures?: number;
  errors?: Array<{
    row: number;
    institution: string;
    error: string;
  }>;
  warnings?: Array<{
    row: number;
    institution: string;
    message: string;
  }>;
  error?: string;
};

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setProgress(0);

    try {
      const text = await file.text();
      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: text,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
      setProgress(100);
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadErrorLog = () => {
    if (!result?.errors?.length && !result?.warnings?.length) return;

    const lines = ["Row,Institution,Type,Message"];
    
    result.errors?.forEach(({ row, institution, error }) => {
      lines.push(`${row},"${institution}",Error,"${error}"`);
    });
    
    result.warnings?.forEach(({ row, institution, message }) => {
      lines.push(`${row},"${institution}",Warning,"${message}"`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Universities Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
            />
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processing data...
              </p>
            </div>
          )}

          {result && !result.error && (
            <div className="space-y-4">
              <Alert className="bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>Successfully imported {result.success} universities.</p>
                    
                    {(result.failures || 0) > 0 && (
                      <p className="text-yellow-600 dark:text-yellow-400">
                        Failed to import {result.failures} entries.
                      </p>
                    )}

                    {(result.warnings?.length || 0) > 0 && (
                      <p className="text-yellow-600 dark:text-yellow-400">
                        {result.warnings?.length} entries skipped due to warnings.
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {((result.errors?.length || 0) > 0 || (result.warnings?.length || 0) > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Import Issues</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadErrorLog}
                        className="text-sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Error Log
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      <div className="space-y-4">
                        {result.errors?.map((error, index) => (
                          <div key={`error-${index}`} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Row {error.row}: {error.institution}</p>
                              <p className="text-muted-foreground">{error.error}</p>
                            </div>
                          </div>
                        ))}
                        {result.warnings?.map((warning, index) => (
                          <div key={`warning-${index}`} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Row {warning.row}: {warning.institution}</p>
                              <p className="text-muted-foreground">{warning.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {result?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}