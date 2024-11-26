"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/lib/supabase/database.types";

export function UniversityCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUniversityCount() {
      try {
        const { count: universityCount, error } = await supabase
          .from("universities")
          .select("*", { count: "exact", head: true });

        if (error) throw error;
        setCount(universityCount);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    getUniversityCount();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Universities</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <p className="text-4xl font-bold">{count}</p>
        )}
      </CardContent>
    </Card>
  );
}