create table public.nurse_applications (
  id uuid not null default gen_random_uuid (),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text null,
  role text null,
  specialty text[] null,
  years_experience text null,
  languages text[] null default '{}'::text[],
  state text null,
  city text null,
  zip text null,
  serves_underserved text null,
  motivation_text text null,
  goal text null,
  hours_per_month text null,
  source text null,
  email_verified boolean not null default false,
  status text not null default 'pending'::text,
  cohort text not null default 'inaugural'::text,
  applied_at timestamp with time zone not null default now(),
  verified_at timestamp with time zone null,
  reviewed_at timestamp with time zone null,
  admin_notes text null,
  training_status text not null default 'not_invited'::text,
  training_invited_at timestamp with time zone null,
  training_invitation_url text null,
  training_invited_by uuid null,
  training_started_at timestamp with time zone null,
  training_completed_at timestamp with time zone null,
  training_status_updated_at timestamp with time zone null,
  training_status_updated_by uuid null,
  license_type text null,
  license_number text null,
  license_state text null,
  license_expiration_date date null,
  license_verification_status text not null default 'not_started'::text,
  license_verified_at timestamp with time zone null,
  license_verified_by uuid null,
  license_verification_notes text null,
  eligible_for_matching boolean not null default false,
  eligibility_updated_at timestamp with time zone null,
  eligibility_notes text null,
  updated_at timestamp with time zone not null default now(),
  applicant_can_edit boolean not null default true,
  last_applicant_edited_at timestamp with time zone null,
  applicant_edit_count integer not null default 0,
  locked_at timestamp with time zone null,
  locked_by uuid null,
  lock_reason text null,
  latitude double precision null,
  longitude double precision null,
  address text null,
  special_experience text[] null default '{}'::text[],
  constraint nurse_applications_pkey primary key (id),
  constraint nurse_applications_email_key unique (email)
) TABLESPACE pg_default;

create index IF not exists idx_nurse_applications_email on public.nurse_applications using btree (email) TABLESPACE pg_default;

create index IF not exists idx_nurse_applications_status on public.nurse_applications using btree (status) TABLESPACE pg_default;

create index IF not exists idx_nurse_applications_applied_at on public.nurse_applications using btree (applied_at desc) TABLESPACE pg_default;

create index IF not exists idx_nurse_applications_lat_lng on public.nurse_applications using btree (latitude, longitude) TABLESPACE pg_default
where
  (
    (latitude is not null)
    and (longitude is not null)
  );

create trigger nurse_applications_updated_at BEFORE
update on nurse_applications for EACH row
execute FUNCTION update_updated_at ();
