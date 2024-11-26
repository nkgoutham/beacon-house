import { NextRequest, NextResponse } from "next/server";
import { parse } from "papaparse";
import { supabaseServer } from "@/lib/supabase/server";
import { parseUniversityRow } from "@/lib/utils/parse-university-data";
import { Database } from "@/lib/supabase/database.types";

type UniversityInsert = Database["public"]["Tables"]["universities"]["Insert"];

export async function POST(request: NextRequest) {
  try {
    const data = await request.text();
    console.log("Starting import process");
    
    const { data: rows, errors: parseErrors } = parse(data, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseErrors.length > 0) {
      console.error("CSV parsing errors:", parseErrors);
      return NextResponse.json(
        { 
          error: "CSV parsing failed", 
          details: parseErrors.map(err => ({
            row: err.row + 1,
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    console.log(`Processing ${rows.length} rows`);

    const results = {
      success: 0,
      failures: 0,
      errors: [] as Array<{
        row: number;
        institution: string;
        error: string;
      }>,
      warnings: [] as Array<{
        row: number;
        institution: string;
        message: string;
      }>,
    };

    // Process rows in smaller batches
    const batchSize = 10;
    const processedData: UniversityInsert[] = [];

    // First, parse all rows and collect valid data
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 for header row and 0-based index
      
      try {
        // Skip rows with API errors or incomplete data
        if (row["Status"]?.includes("API error") || row["Status"]?.includes("Error")) {
          console.log(`Skipping row ${rowNumber} due to API error status`);
          results.warnings.push({
            row: rowNumber,
            institution: row["institution"] || "Unknown",
            message: "Skipped due to API error status",
          });
          continue;
        }

        const universityData = parseUniversityRow(row);
        processedData.push(universityData);
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.failures++;
        results.errors.push({
          row: rowNumber,
          institution: row["institution"] || "Unknown",
          error: error instanceof Error ? error.message : "Data processing error",
        });
      }
    }

    console.log(`Successfully parsed ${processedData.length} records`);

    // Then, insert in batches
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      try {
        console.log(`Processing batch ${batchNumber} (${batch.length} records)`);
        
        const { error: upsertError } = await supabaseServer
          .from("universities")
          .upsert(batch, {
            onConflict: 'institution,country',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error(`Batch ${batchNumber} insert error:`, upsertError);
          results.failures += batch.length;
          results.errors.push({
            row: i + 2,
            institution: "Batch " + batchNumber,
            error: `Database insert failed: ${upsertError.message}`,
          });
        } else {
          console.log(`Batch ${batchNumber} successful`);
          results.success += batch.length;
        }
      } catch (error) {
        console.error(`Batch ${batchNumber} failed:`, error);
        results.failures += batch.length;
        results.errors.push({
          row: i + 2,
          institution: "Batch " + batchNumber,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log("Import process completed", {
      success: results.success,
      failures: results.failures,
      errors: results.errors.length,
      warnings: results.warnings.length,
    });

    if (results.success === 0 && results.failures === 0) {
      return NextResponse.json(
        { error: "No valid data to import" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: results.success,
      failures: results.failures,
      errors: results.errors,
      warnings: results.warnings,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { 
        error: "Import failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}