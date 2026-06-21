export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          white_label_config: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          white_label_config?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          white_label_config?: Json
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          org_id: string
          full_name: string
          email: string
          role: Database['public']['Enums']['user_role']
          referral_partner_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          org_id: string
          full_name: string
          email: string
          role?: Database['public']['Enums']['user_role']
          referral_partner_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          full_name?: string
          email?: string
          role?: Database['public']['Enums']['user_role']
          referral_partner_id?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      referral_partners: {
        Row: {
          id: string
          org_id: string
          profile_id: string | null
          name: string
          email: string | null
          phone: string | null
          company: string | null
          commission_pct: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          profile_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          commission_pct?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          profile_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          commission_pct?: number
          notes?: string | null
          created_at?: string
        }
      }
      funding_files: {
        Row: {
          id: string
          org_id: string
          file_code: string
          client_name: string
          business_name: string | null
          email: string | null
          phone: string | null
          state: string | null
          business_type: string | null
          ein_last4: string | null
          industry: string | null
          time_in_business: string | null
          monthly_revenue: number | null
          est_fico: number | null
          funding_goal: number | null
          funding_type: string | null
          success_fee_pct: number
          assigned_user_id: string | null
          referral_partner_id: string | null
          stage: Database['public']['Enums']['pipeline_stage']
          current_status: string | null
          last_contact_date: string | null
          next_followup_date: string | null
          internal_notes: string | null
          client_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          file_code?: string
          client_name: string
          business_name?: string | null
          email?: string | null
          phone?: string | null
          state?: string | null
          business_type?: string | null
          ein_last4?: string | null
          industry?: string | null
          time_in_business?: string | null
          monthly_revenue?: number | null
          est_fico?: number | null
          funding_goal?: number | null
          funding_type?: string | null
          success_fee_pct?: number
          assigned_user_id?: string | null
          referral_partner_id?: string | null
          stage?: Database['public']['Enums']['pipeline_stage']
          current_status?: string | null
          last_contact_date?: string | null
          next_followup_date?: string | null
          internal_notes?: string | null
          client_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          file_code?: string
          client_name?: string
          business_name?: string | null
          email?: string | null
          phone?: string | null
          state?: string | null
          business_type?: string | null
          ein_last4?: string | null
          industry?: string | null
          time_in_business?: string | null
          monthly_revenue?: number | null
          est_fico?: number | null
          funding_goal?: number | null
          funding_type?: string | null
          success_fee_pct?: number
          assigned_user_id?: string | null
          referral_partner_id?: string | null
          stage?: Database['public']['Enums']['pipeline_stage']
          current_status?: string | null
          last_contact_date?: string | null
          next_followup_date?: string | null
          internal_notes?: string | null
          client_summary?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lenders: {
        Row: {
          id: string
          org_id: string
          name: string
          is_active: boolean
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          is_active?: boolean
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          is_active?: boolean
        }
      }
      products: {
        Row: {
          id: string
          org_id: string
          category: string
          name: string
          default_lender_id: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          org_id: string
          category: string
          name: string
          default_lender_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          org_id?: string
          category?: string
          name?: string
          default_lender_id?: string | null
          is_active?: boolean
        }
      }
      applications: {
        Row: {
          id: string
          org_id: string
          funding_file_id: string
          product_id: string | null
          lender_id: string | null
          category: string | null
          product_name: string | null
          status: Database['public']['Enums']['app_status']
          submitted_date: string | null
          decision_date: string | null
          approved_amount: number | null
          funded_amount: number | null
          rate_terms: string | null
          verification_required: boolean | null
          verification_status: string | null
          followup_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          funding_file_id: string
          product_id?: string | null
          lender_id?: string | null
          category?: string | null
          product_name?: string | null
          status?: Database['public']['Enums']['app_status']
          submitted_date?: string | null
          decision_date?: string | null
          approved_amount?: number | null
          funded_amount?: number | null
          rate_terms?: string | null
          verification_required?: boolean | null
          verification_status?: string | null
          followup_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          funding_file_id?: string
          product_id?: string | null
          lender_id?: string | null
          category?: string | null
          product_name?: string | null
          status?: Database['public']['Enums']['app_status']
          submitted_date?: string | null
          decision_date?: string | null
          approved_amount?: number | null
          funded_amount?: number | null
          rate_terms?: string | null
          verification_required?: boolean | null
          verification_status?: string | null
          followup_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          org_id: string
          funding_file_id: string
          name: string
          tier: Database['public']['Enums']['doc_tier']
          status: Database['public']['Enums']['doc_status']
          storage_path: string | null
          upload_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          funding_file_id: string
          name: string
          tier?: Database['public']['Enums']['doc_tier']
          status?: Database['public']['Enums']['doc_status']
          storage_path?: string | null
          upload_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          funding_file_id?: string
          name?: string
          tier?: Database['public']['Enums']['doc_tier']
          status?: Database['public']['Enums']['doc_status']
          storage_path?: string | null
          upload_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          org_id: string
          funding_file_id: string | null
          title: string
          assigned_user_id: string | null
          due_date: string | null
          priority: string
          status: Database['public']['Enums']['task_status']
          task_type: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          funding_file_id?: string | null
          title: string
          assigned_user_id?: string | null
          due_date?: string | null
          priority?: string
          status?: Database['public']['Enums']['task_status']
          task_type?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          funding_file_id?: string | null
          title?: string
          assigned_user_id?: string | null
          due_date?: string | null
          priority?: string
          status?: Database['public']['Enums']['task_status']
          task_type?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      revenue: {
        Row: {
          id: string
          org_id: string
          funding_file_id: string
          funded_amount: number
          gross_revenue: number
          net_revenue: number
          success_fee_pct: number
          success_fee_amount: number
          sales_rep_commission: number
          referral_commission: number
          bank_fees: number
          profit: number
          success_fee_invoice_sent: boolean
          success_fee_collected: boolean
          collection_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          funding_file_id: string
          funded_amount?: number
          gross_revenue?: number
          net_revenue?: number
          success_fee_pct?: number
          success_fee_amount?: number
          sales_rep_commission?: number
          referral_commission?: number
          bank_fees?: number
          profit?: number
          success_fee_invoice_sent?: boolean
          success_fee_collected?: boolean
          collection_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          funding_file_id?: string
          funded_amount?: number
          gross_revenue?: number
          net_revenue?: number
          success_fee_pct?: number
          success_fee_amount?: number
          sales_rep_commission?: number
          referral_commission?: number
          bank_fees?: number
          profit?: number
          success_fee_invoice_sent?: boolean
          success_fee_collected?: boolean
          collection_date?: string | null
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          org_id: string
          actor_id: string | null
          entity: string
          entity_id: string | null
          action: string
          meta: Json
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          actor_id?: string | null
          entity: string
          entity_id?: string | null
          action: string
          meta?: Json
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          actor_id?: string | null
          entity?: string
          entity_id?: string | null
          action?: string
          meta?: Json
          created_at?: string
        }
      }
    }
    Views: {
      partner_files_view: {
        Row: {
          id: string | null
          org_id: string | null
          file_code: string | null
          client_name: string | null
          business_name: string | null
          stage: Database['public']['Enums']['pipeline_stage'] | null
          current_status: string | null
          referral_partner_id: string | null
          created_at: string | null
        }
      }
    }
    Functions: {
      current_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database['public']['Enums']['user_role']
      }
      current_partner_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      user_role: 'admin' | 'funding_manager' | 'virtual_assistant' | 'referral_partner' | 'client'
      pipeline_stage:
        | 'lead_received'
        | 'appointment_scheduled'
        | 'consultation_completed'
        | 'application_sent'
        | 'application_submitted'
        | 'documents_requested'
        | 'documents_received'
        | 'conditions_before_submission'
        | 'submitted_for_funding'
        | 'verification'
        | 'funded'
        | 'success_fee_invoice_sent'
        | 'success_fee_collected'
        | 'referral_request'
      doc_tier: 'required' | 'preferred' | 'optional'
      doc_status: 'missing' | 'requested' | 'uploaded' | 'not_applicable'
      app_status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'declined' | 'funded'
      task_status: 'open' | 'in_progress' | 'done'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>
export type FundingFile = Tables<'funding_files'>
export type ReferralPartner = Tables<'referral_partners'>
export type Application = Tables<'applications'>
export type Document = Tables<'documents'>
export type Task = Tables<'tasks'>
export type Revenue = Tables<'revenue'>
export type ActivityLog = Tables<'activity_log'>
export type UserRole = Enums<'user_role'>
export type PipelineStage = Enums<'pipeline_stage'>
