import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, GraduationCap, BarChart3 } from "lucide-react";
import type { University } from "@/types/university";

export function UniversityCard({ university }: { university: University }) {
  return (
    <Card className="w-full max-w-2xl hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {university.institution}
          </CardTitle>
          {university.rank && (
            <Badge variant={university.uniType === "partner_uni_type_1" ? "default" : 
                          university.uniType === "partner_uni_type_2" ? "secondary" : "outline"}>
              #{university.rank}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{university.country}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(university.enrollment?.total || university.acceptanceRate) && (
          <div className="grid grid-cols-2 gap-4">
            {university.enrollment?.total && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Total Students: {university.enrollment.total.toLocaleString()}</span>
              </div>
            )}
            {university.acceptanceRate && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>Acceptance: {typeof university.acceptanceRate === 'number' ? 
                  `${university.acceptanceRate}%` : university.acceptanceRate}</span>
              </div>
            )}
          </div>
        )}
        {(university.satScoreRange || university.actRange || university.gpaRange) && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Score Requirements
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {university.satScoreRange && (
                <div>
                  {university.satScoreRange.ebrw && (
                    <p>SAT EBRW: {university.satScoreRange.ebrw.min}-{university.satScoreRange.ebrw.max}</p>
                  )}
                  {university.satScoreRange.math && (
                    <p>SAT Math: {university.satScoreRange.math.min}-{university.satScoreRange.math.max}</p>
                  )}
                </div>
              )}
              <div>
                {university.actRange && (
                  <p>ACT: {university.actRange.min}-{university.actRange.max}</p>
                )}
                {university.gpaRange && (
                  <p>GPA: {university.gpaRange.min}-{university.gpaRange.max}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}