import { Database } from "@/lib/supabase/database.types";

type UniversityInsert = Database["public"]["Tables"]["universities"]["Insert"];

function cleanNumber(value: string): number | null {
  if (!value || value === "Not reported") return null;
  // Remove commas and any other non-numeric characters except decimal points
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}

export function parseSATRange(satString: string): {
  ebrw_min: number | null;
  ebrw_max: number | null;
  math_min: number | null;
  math_max: number | null;
} {
  console.log("Parsing SAT Range:", satString);
  const result = {
    ebrw_min: null,
    ebrw_max: null,
    math_min: null,
    math_max: null,
  };

  if (!satString || satString === "Not reported") return result;

  try {
    const parts = satString.split("|").map(part => part.trim());
    console.log("SAT parts:", parts);
    
    parts.forEach(part => {
      const numbers = part.match(/\d+/g)?.map(Number);
      console.log("SAT numbers found:", numbers);
      
      if (part.includes("EBRW") && numbers?.length === 2) {
        [result.ebrw_min, result.ebrw_max] = numbers;
      } else if (part.includes("Math") && numbers?.length === 2) {
        [result.math_min, result.math_max] = numbers;
      }
    });
  } catch (error) {
    console.error("SAT parsing error:", error);
  }

  console.log("Parsed SAT result:", result);
  return result;
}

export function parseRange(rangeString: string): {
  min: number | null;
  max: number | null;
} {
  console.log("Parsing range:", rangeString);
  const result = { min: null, max: null };
  
  if (!rangeString || rangeString === "Not reported") return result;

  try {
    const numbers = rangeString.match(/[\d.]+/g)?.map(Number);
    console.log("Range numbers found:", numbers);
    
    if (numbers?.length === 2) {
      [result.min, result.max] = numbers;
    } else if (numbers?.length === 1) {
      result.min = result.max = numbers[0];
    }
  } catch (error) {
    console.error("Range parsing error:", error);
  }

  console.log("Parsed range result:", result);
  return result;
}

export function parseAcceptanceRate(rateString: string): string | null {
  console.log("Parsing acceptance rate:", rateString);
  if (!rateString || rateString === "Not reported") return null;
  return rateString;
}

export function parseEnrollment(enrollmentString: string): {
  total: number | null;
  international: number | null;
} {
  console.log("Parsing enrollment:", enrollmentString);
  const result = {
    total: null,
    international: null,
  };

  if (!enrollmentString || enrollmentString === "Not reported") return result;

  try {
    const parts = enrollmentString.split("|").map(part => part.trim());
    console.log("Enrollment parts:", parts);
    
    parts.forEach(part => {
      if (part.startsWith("Total:")) {
        result.total = cleanNumber(part.replace("Total:", ""));
      } else if (part.startsWith("Int'l:")) {
        const intlValue = part.replace("Int'l:", "").trim();
        if (intlValue.includes(".") && result.total) {
          // Handle percentage values
          const percentage = parseFloat(intlValue);
          if (!isNaN(percentage)) {
            result.international = Math.round(result.total * (percentage / 100));
          }
        } else {
          result.international = cleanNumber(intlValue);
        }
      }
    });
  } catch (error) {
    console.error("Enrollment parsing error:", error);
  }

  console.log("Parsed enrollment result:", result);
  return result;
}

export function parseUniversityRow(row: Record<string, string>): UniversityInsert {
  console.log("Processing row:", row);

  const satScores = parseSATRange(row["SAT Score Range"]);
  const actRange = parseRange(row["ACT Range"]);
  const gpaRange = parseRange(row["GPA Range"]);
  const enrollment = parseEnrollment(row["Enrollment"]);
  
  let rank: number | null = null;
  if (row["2025_rank"]) {
    const rankStr = row["2025_rank"].split("-")[0];
    rank = cleanNumber(rankStr);
  }

  const dataAccuracy = cleanNumber(row["Data Accuracy"]);

  if (!row["institution"]) {
    throw new Error("Institution name is required");
  }

  if (!row["country"]) {
    throw new Error("Country is required");
  }

  const result = {
    rank,
    institution: row["institution"],
    country: row["country"],
    size: row["size"] || null,
    uni_type: "other",
    sat_ebrw_min: satScores.ebrw_min,
    sat_ebrw_max: satScores.ebrw_max,
    sat_math_min: satScores.math_min,
    sat_math_max: satScores.math_max,
    act_min: actRange.min,
    act_max: actRange.max,
    gpa_min: gpaRange.min,
    gpa_max: gpaRange.max,
    acceptance_rate: row["Acceptance Rate (historical)"] || null,
    enrollment_total: enrollment.total,
    enrollment_international: enrollment.international,
    data_accuracy: dataAccuracy,
  };

  console.log("Parsed university data:", result);
  return result;
}