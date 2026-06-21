-- supabase/seed.sql
-- Seed: 1 org, 3 users, 3 referral partners, 5 funding files

-- =====================
-- ORGANIZATION
-- =====================
insert into organizations (id, name, slug) values
  ('00000000-0000-0000-0000-000000000001', 'Vantage Funding', 'vantage');

-- =====================
-- AUTH USERS (via supabase auth schema)
-- Note: In real setup use supabase auth admin API or dashboard to create these
-- These inserts are illustrative; actual auth.users inserts require service role
-- =====================

-- For seeding purposes, we insert profiles assuming auth users already exist.
-- Create these 3 users in Supabase Auth first:
--   admin@vantage.io        (UUID: 00000000-0000-0000-0000-000000000010)
--   manager@vantage.io      (UUID: 00000000-0000-0000-0000-000000000011)
--   va@vantage.io           (UUID: 00000000-0000-0000-0000-000000000012)

-- =====================
-- PROFILES
-- =====================
insert into profiles (id, org_id, full_name, email, role) values
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'Alex Rivera',
    'admin@vantage.io',
    'admin'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    'Morgan Chen',
    'manager@vantage.io',
    'funding_manager'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    'Jordan Lee',
    'va@vantage.io',
    'virtual_assistant'
  );

-- =====================
-- REFERRAL PARTNERS
-- =====================
insert into referral_partners (id, org_id, name, email, phone, company, commission_pct, notes) values
  (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000001',
    'Sandra Kim',
    'sandra@partnerco.com',
    '555-100-2001',
    'Partner Co LLC',
    0.10,
    'Top referral partner, specializes in restaurant clients'
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000001',
    'David Torres',
    'david@brokerage.net',
    '555-100-2002',
    'Torres Brokerage',
    0.08,
    'Focuses on construction and trades'
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000001',
    'Priya Patel',
    'priya@capitalbridge.io',
    '555-100-2003',
    'Capital Bridge',
    0.12,
    'High-volume partner, monthly referrals'
  );

-- =====================
-- FUNDING FILES
-- =====================
insert into funding_files (
  id, org_id, file_code, client_name, business_name, email, phone, state,
  business_type, industry, time_in_business, monthly_revenue, est_fico,
  funding_goal, funding_type, success_fee_pct, assigned_user_id,
  referral_partner_id, stage, current_status, last_contact_date,
  next_followup_date, internal_notes
) values
  (
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000001',
    'VF-1000',
    'Maria Gonzalez',
    'Gonzalez Grill LLC',
    'maria@gonzalezgrill.com',
    '555-200-3001',
    'FL',
    'LLC',
    'Food & Beverage',
    '3 years',
    45000,
    680,
    150000,
    'Business Line of Credit',
    0.10,
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000020',
    'documents_received',
    'Awaiting underwriting review',
    '2026-06-18',
    '2026-06-23',
    'Strong revenue, seasonal dips in Q1. Partner Sandra Kim referred.'
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000001',
    'VF-1001',
    'James Carter',
    'Carter Construction Inc',
    'jcarter@carterconstruction.com',
    '555-200-3002',
    'TX',
    'S-Corp',
    'Construction',
    '7 years',
    120000,
    720,
    500000,
    'SBA 7(a) Loan',
    0.08,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000021',
    'submitted_for_funding',
    'Submitted to First National Bank',
    '2026-06-19',
    '2026-06-25',
    'Long history, solid cash flow. SBA package complete.'
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000001',
    'VF-1002',
    'Aisha Williams',
    'Williams Tech Solutions',
    'aisha@williamstech.io',
    '555-200-3003',
    'GA',
    'LLC',
    'Technology',
    '2 years',
    28000,
    650,
    75000,
    'Revenue-Based Financing',
    0.10,
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000022',
    'consultation_completed',
    'Application package being prepared',
    '2026-06-15',
    '2026-06-22',
    'Young business but MRR growing 20% MoM. Good fit for RBF.'
  ),
  (
    '00000000-0000-0000-0000-000000000033',
    '00000000-0000-0000-0000-000000000001',
    'VF-1003',
    'Robert Nguyen',
    'Nguyen Auto Group',
    'robert@nguyenauto.com',
    '555-200-3004',
    'CA',
    'C-Corp',
    'Automotive',
    '12 years',
    280000,
    760,
    1000000,
    'Commercial Real Estate Loan',
    0.08,
    '00000000-0000-0000-0000-000000000011',
    null,
    'funded',
    'Funded — success fee invoice sent',
    '2026-06-10',
    null,
    'Flagship deal. Funded $950k. Success fee invoice sent 6/10.'
  ),
  (
    '00000000-0000-0000-0000-000000000034',
    '00000000-0000-0000-0000-000000000001',
    'VF-1004',
    'Tanya Brooks',
    'Brooks Beauty Bar',
    'tanya@brooksbeauty.com',
    '555-200-3005',
    'NY',
    'Sole Proprietor',
    'Personal Services',
    '5 years',
    18000,
    610,
    40000,
    'Merchant Cash Advance',
    0.12,
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000020',
    'lead_received',
    'Initial intake complete, appointment not yet scheduled',
    '2026-06-20',
    '2026-06-24',
    'Referred by Sandra. FICO borderline but strong card revenue.'
  );
