-- Drop existing table and indexes
drop table if exists public.universities cascade;

-- Create universities table
create table public.universities (
  id uuid primary key default gen_random_uuid(),
  rank integer,
  institution text not null,
  country text not null,
  size text,
  uni_type text default 'other',
  sat_ebrw_min integer,
  sat_ebrw_max integer,
  sat_math_min integer,
  sat_math_max integer,
  act_min integer,
  act_max integer,
  gpa_min numeric(4,2),  -- Changed from (3,2) to handle values > 4
  gpa_max numeric(4,2),  -- Changed from (3,2) to handle values > 4
  acceptance_rate numeric(6,3),
  enrollment_total integer,
  enrollment_international integer,
  data_accuracy numeric(5,2),
  created_at timestamp with time zone default now(),
  
  -- Add computed columns for data availability
  has_sat_data boolean generated always as (
    sat_ebrw_min is not null and sat_ebrw_max is not null and 
    sat_math_min is not null and sat_math_max is not null
  ) stored,
  
  has_act_data boolean generated always as (
    act_min is not null and act_max is not null
  ) stored,
  
  has_gpa_data boolean generated always as (
    gpa_min is not null and gpa_max is not null
  ) stored,

  -- Modified constraints
  constraint valid_rank check (rank is null or rank > 0),
  constraint valid_sat_ebrw check (
    (sat_ebrw_min is null and sat_ebrw_max is null) or
    (sat_ebrw_min <= sat_ebrw_max)
  ),
  constraint valid_sat_math check (
    (sat_math_min is null and sat_math_max is null) or
    (sat_math_min <= sat_math_max)
  ),
  constraint valid_act check (
    (act_min is null and act_max is null) or
    (act_min <= act_max)
  ),
  constraint valid_gpa check (
    (gpa_min is null and gpa_max is null) or
    (gpa_min <= gpa_max)
  ),
  constraint valid_acceptance_rate check (
    acceptance_rate is null or
    (acceptance_rate >= 0 and acceptance_rate <= 1)  -- Changed to handle decimal percentages
  ),
  constraint valid_enrollment check (
    enrollment_international is null or
    enrollment_total is null or
    enrollment_international <= enrollment_total
  ),
  constraint valid_data_accuracy check (
    data_accuracy is null or
    (data_accuracy >= 0 and data_accuracy <= 100)
  )
);

-- Create indexes
create index idx_universities_rank on public.universities(rank);
create index idx_universities_country on public.universities(country);
create index idx_universities_uni_type on public.universities(uni_type);
create index idx_universities_has_sat on public.universities(has_sat_data);
create index idx_universities_has_act on public.universities(has_act_data);
create index idx_universities_has_gpa on public.universities(has_gpa_data);