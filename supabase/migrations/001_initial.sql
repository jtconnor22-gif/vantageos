-- supabase/migrations/001_initial.sql

-- ENUMS
create type user_role as enum ('admin','funding_manager','virtual_assistant','referral_partner','client');
create type pipeline_stage as enum (
  'lead_received','appointment_scheduled','consultation_completed',
  'application_sent','application_submitted','documents_requested','documents_received',
  'conditions_before_submission','submitted_for_funding','verification','funded',
  'success_fee_invoice_sent','success_fee_collected','referral_request'
);
create type doc_tier as enum ('required','preferred','optional');
create type doc_status as enum ('missing','requested','uploaded','not_applicable');
create type app_status as enum ('draft','submitted','in_review','approved','declined','funded');
create type task_status as enum ('open','in_progress','done');

-- ORGANIZATIONS
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  white_label_config jsonb default '{}',
  created_at timestamptz default now()
);

-- PROFILES (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  org_id uuid not null references organizations,
  full_name text not null,
  email text not null,
  role user_role not null default 'virtual_assistant',
  referral_partner_id uuid,
  is_active bool not null default true,
  created_at timestamptz default now()
);

-- REFERRAL PARTNERS
create table referral_partners (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  profile_id uuid references profiles,
  name text not null,
  email text,
  phone text,
  company text,
  commission_pct numeric not null default 0,
  notes text,
  created_at timestamptz default now()
);

-- Add FK from profiles to referral_partners
alter table profiles add constraint profiles_referral_partner_id_fkey
  foreign key (referral_partner_id) references referral_partners;

-- FUNDING FILES
create table funding_files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  file_code text not null,
  client_name text not null,
  business_name text,
  email text,
  phone text,
  state text,
  business_type text,
  ein_last4 text,
  industry text,
  time_in_business text,
  monthly_revenue numeric,
  est_fico int,
  funding_goal numeric,
  funding_type text,
  success_fee_pct numeric not null default 0.10,
  assigned_user_id uuid references profiles,
  referral_partner_id uuid references referral_partners,
  stage pipeline_stage not null default 'lead_received',
  current_status text,
  last_contact_date date,
  next_followup_date date,
  internal_notes text,
  client_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LENDERS
create table lenders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  name text not null,
  is_active bool not null default true
);

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  category text not null,
  name text not null,
  default_lender_id uuid references lenders,
  is_active bool not null default true
);

-- APPLICATIONS
create table applications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  funding_file_id uuid not null references funding_files on delete cascade,
  product_id uuid references products,
  lender_id uuid references lenders,
  category text,
  product_name text,
  status app_status not null default 'draft',
  submitted_date date,
  decision_date date,
  approved_amount numeric,
  funded_amount numeric,
  rate_terms text,
  verification_required bool default false,
  verification_status text,
  followup_date date,
  notes text,
  created_at timestamptz default now()
);

-- DOCUMENTS
create table documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  funding_file_id uuid not null references funding_files on delete cascade,
  name text not null,
  tier doc_tier not null default 'required',
  status doc_status not null default 'missing',
  storage_path text,
  upload_date date,
  notes text,
  created_at timestamptz default now()
);

-- TASKS
create table tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  funding_file_id uuid references funding_files on delete set null,
  title text not null,
  assigned_user_id uuid references profiles,
  due_date date,
  priority text not null default 'medium',
  status task_status not null default 'open',
  task_type text,
  notes text,
  created_at timestamptz default now()
);

-- REVENUE
create table revenue (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  funding_file_id uuid not null references funding_files on delete cascade,
  funded_amount numeric not null default 0,
  gross_revenue numeric not null default 0,
  net_revenue numeric not null default 0,
  success_fee_pct numeric not null default 0.10,
  success_fee_amount numeric not null default 0,
  sales_rep_commission numeric not null default 0,
  referral_commission numeric not null default 0,
  bank_fees numeric not null default 0,
  profit numeric not null default 0,
  success_fee_invoice_sent bool not null default false,
  success_fee_collected bool not null default false,
  collection_date date,
  created_at timestamptz default now()
);

-- ACTIVITY LOG
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations,
  actor_id uuid references profiles,
  entity text not null,
  entity_id uuid,
  action text not null,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

-- =====================================
-- UPDATED_AT TRIGGER
-- =====================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger funding_files_updated_at
  before update on funding_files
  for each row execute function update_updated_at();

-- =====================================
-- FILE CODE GENERATOR
-- =====================================
create sequence file_code_seq start 1000;

create or replace function generate_file_code()
returns trigger language plpgsql as $$
begin
  new.file_code = 'VF-' || nextval('file_code_seq');
  return new;
end; $$;

create trigger funding_files_file_code
  before insert on funding_files
  for each row when (new.file_code is null or new.file_code = '')
  execute function generate_file_code();

-- =====================================
-- ROW LEVEL SECURITY
-- =====================================
alter table organizations    enable row level security;
alter table profiles         enable row level security;
alter table referral_partners enable row level security;
alter table funding_files    enable row level security;
alter table lenders          enable row level security;
alter table products         enable row level security;
alter table applications     enable row level security;
alter table documents        enable row level security;
alter table tasks            enable row level security;
alter table revenue          enable row level security;
alter table activity_log     enable row level security;

-- Helper function: get current user's org_id
create or replace function current_org_id()
returns uuid language sql stable security definer as $$
  select org_id from profiles where id = auth.uid()
$$;

-- Helper function: get current user's role
create or replace function current_user_role()
returns user_role language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- Helper function: get current user's referral_partner_id
create or replace function current_partner_id()
returns uuid language sql stable security definer as $$
  select referral_partner_id from profiles where id = auth.uid()
$$;

-- ORGANIZATIONS: users can only see their own org
create policy "org_select" on organizations for select
  using (id = current_org_id());

-- PROFILES: org-scoped
create policy "profiles_select" on profiles for select
  using (org_id = current_org_id());

create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- REFERRAL PARTNERS: org-scoped
create policy "partners_select" on referral_partners for select
  using (org_id = current_org_id());

create policy "partners_insert" on referral_partners for insert
  with check (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

create policy "partners_update" on referral_partners for update
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

-- FUNDING FILES: org-scoped; referral_partners see only their files
create policy "files_select_internal" on funding_files for select
  using (
    org_id = current_org_id() and
    current_user_role() in ('admin','funding_manager','virtual_assistant')
  );

create policy "files_select_partner" on funding_files for select
  using (
    org_id = current_org_id() and
    current_user_role() = 'referral_partner' and
    referral_partner_id = current_partner_id()
  );

create policy "files_insert" on funding_files for insert
  with check (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

create policy "files_update" on funding_files for update
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'));

create policy "files_delete" on funding_files for delete
  using (org_id = current_org_id() and current_user_role() = 'admin');

-- LENDERS & PRODUCTS: org-scoped
create policy "lenders_select" on lenders for select using (org_id = current_org_id());
create policy "lenders_write" on lenders for all
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'))
  with check (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

create policy "products_select" on products for select using (org_id = current_org_id());
create policy "products_write" on products for all
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'))
  with check (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

-- APPLICATIONS: internal only (partners can't see applications)
create policy "apps_select" on applications for select
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'));

create policy "apps_write" on applications for all
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'))
  with check (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'));

-- DOCUMENTS: internal all; partners can see their file's docs (no content, just checklist)
create policy "docs_select_internal" on documents for select
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'));

create policy "docs_write" on documents for all
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'))
  with check (org_id = current_org_id());

-- TASKS: org-scoped internal
create policy "tasks_select" on tasks for select
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'));

create policy "tasks_write" on tasks for all
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager','virtual_assistant'))
  with check (org_id = current_org_id());

-- REVENUE: admin + funding_manager only
create policy "revenue_select" on revenue for select
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

create policy "revenue_write" on revenue for all
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'))
  with check (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

-- ACTIVITY LOG: org-scoped read for admin/manager; insert for all internal
create policy "activity_select" on activity_log for select
  using (org_id = current_org_id() and current_user_role() in ('admin','funding_manager'));

create policy "activity_insert" on activity_log for insert
  with check (org_id = current_org_id());

-- =====================================
-- PARTNER PORTAL VIEW (no revenue/financials)
-- =====================================
create or replace view partner_files_view as
  select
    f.id, f.org_id, f.file_code, f.client_name, f.business_name,
    f.stage, f.current_status, f.referral_partner_id, f.created_at
  from funding_files f;

-- Grant select on view to authenticated
grant select on partner_files_view to authenticated;
