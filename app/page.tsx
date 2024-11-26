import { UniversityCard } from "@/components/university-card";
import { UniversityCount } from "@/components/university-count";

// Sample university data
const sampleUniversity = {
  rank: 1,
  institution: "Massachusetts Institute of Technology",
  country: "United States",
  size: "Medium",
  satScoreRange: {
    ebrw: { min: 720, max: 780 },
    math: { min: 780, max: 800 }
  },
  actRange: { min: 34, max: 36 },
  gpaRange: { min: 4.17, max: 4.34 },
  acceptanceRate: 6.7,
  enrollment: {
    total: 11934,
    international: 3795
  },
  dataAccuracy: 98,
  uniType: "partner_uni_type_1" as const
};

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Database Status</h2>
          <UniversityCount />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sample University Card</h2>
          <UniversityCard university={sampleUniversity} />
        </div>
      </div>
    </div>
  );
}