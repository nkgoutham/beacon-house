"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, AlertCircle, Loader2 } from "lucide-react";
import { parse } from "papaparse";
import { parseUniversityRow } from "@/lib/utils/parse-university-data";

export default function DebugPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const text = await file.text();
      console.log("Raw CSV data:", text);

      const { data: rows, errors: parseErrors } = parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        preview: 3, // Only parse first 3 rows
      });

      if (parseErrors.length > 0) {
        console.error("CSV parsing errors:", parseErrors);
        throw new Error("CSV parsing failed");
      }

      const parsedRows = rows.map((row: any, index: number) => {
        try {
          console.log(`Processing row ${index + 1}:`, row);
          const parsed = parseUniversityRow(row);
          console.log(`Parsed row ${index + 1}:`, parsed);
          return parsed;
        } catch (error) {
          console.error(`Error parsing row ${index + 1}:`, error);
          throw error;
        }
      });

      setPreviewData(parsedRows);
    } catch (error) {
      console.error("Preview error:", error);
      setError(error instanceof Error ? error.message : "Failed to parse data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Data Import</CardTitle>
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
              onClick={handlePreview}
              disabled={!file || loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Data
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {previewData && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Preview (First 3 Rows)</h3>
              <div className="overflow-auto">
                <pre className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Open your browser&apos;s developer console (F12) to see detailed parsing logs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}