export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string
          rank: number | null
          institution: string
          country: string
          size: string | null
          uni_type: string
          sat_ebrw_min: number | null
          sat_ebrw_max: number | null
          sat_math_min: number | null
          sat_math_max: number | null
          act_min: number | null
          act_max: number | null
          gpa_min: number | null
          gpa_max: number | null
          acceptance_rate: number | null
          enrollment_total: number | null
          enrollment_international: number | null
          data_accuracy: number | null
          created_at: string
        }
        Insert: {
          id?: string
          rank?: number | null
          institution: string
          country: string
          size?: string | null
          uni_type?: string
          sat_ebrw_min?: number | null
          sat_ebrw_max?: number | null
          sat_math_min?: number | null
          sat_math_max?: number | null
          act_min?: number | null
          act_max?: number | null
          gpa_min?: number | null
          gpa_max?: number | null
          acceptance_rate?: number | null
          enrollment_total?: number | null
          enrollment_international?: number | null
          data_accuracy?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          rank?: number | null
          institution?: string
          country?: string
          size?: string | null
          uni_type?: string
          sat_ebrw_min?: number | null
          sat_ebrw_max?: number | null
          sat_math_min?: number | null
          sat_math_max?: number | null
          act_min?: number | null
          act_max?: number | null
          gpa_min?: number | null
          gpa_max?: number | null
          acceptance_rate?: number | null
          enrollment_total?: number | null
          enrollment_international?: number | null
          data_accuracy?: number | null
          created_at?: string
        }
      }
    }
  }
}