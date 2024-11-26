export type University = {
  rank?: number;
  institution: string;
  country: string;
  size?: string;
  satScoreRange?: {
    ebrw?: {
      min: number;
      max: number;
    };
    math?: {
      min: number;
      max: number;
    };
  };
  actRange?: {
    min: number;
    max: number;
  };
  gpaRange?: {
    min: number;
    max: number;
  };
  acceptanceRate?: string | number;
  enrollment?: {
    total: number;
    international: number;
  };
  dataAccuracy?: number;
  uniType: "partner_uni_type_1" | "partner_uni_type_2" | "other";
};