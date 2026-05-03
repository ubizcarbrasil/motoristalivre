export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliates: {
        Row: {
          business_name: string | null
          business_type: string | null
          created_at: string
          id: string
          is_approved: boolean
          referral_code: string | null
          slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id: string
          is_approved?: boolean
          referral_code?: string | null
          slug: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          referral_code?: string | null
          slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          payload: Json | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cashback_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          passenger_id: string
          ride_id: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["cashback_type"]
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          passenger_id: string
          ride_id?: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["cashback_type"]
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          passenger_id?: string
          ride_id?: string | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["cashback_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cashback_transactions_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_transactions_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_ledger: {
        Row: {
          base_amount: number
          commission_amount: number
          commission_percent: number
          created_at: string
          id: string
          kind: string
          lead_id: string | null
          paid_at: string | null
          payer_driver_id: string
          receiver_driver_id: string
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          base_amount: number
          commission_amount: number
          commission_percent: number
          created_at?: string
          id?: string
          kind?: string
          lead_id?: string | null
          paid_at?: string | null
          payer_driver_id: string
          receiver_driver_id: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          base_amount?: number
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          id?: string
          kind?: string
          lead_id?: string | null
          paid_at?: string | null
          payer_driver_id?: string
          receiver_driver_id?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_ledger_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_payer_driver_id_fkey"
            columns: ["payer_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_receiver_driver_id_fkey"
            columns: ["receiver_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          ativo: boolean
          category_id: string
          comissao_cobertura_pct: number
          comissao_fixa_brl: number
          comissao_indicacao_pct: number
          created_at: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          category_id: string
          comissao_cobertura_pct?: number
          comissao_fixa_brl?: number
          comissao_indicacao_pct?: number
          created_at?: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          category_id?: string
          comissao_cobertura_pct?: number
          comissao_fixa_brl?: number
          comissao_indicacao_pct?: number
          created_at?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          booking_id: string | null
          commission_context: string
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at: string
          from_wallet_id: string | null
          id: string
          processed_at: string | null
          ride_id: string | null
          status: Database["public"]["Enums"]["commission_status"]
          tenant_id: string
          to_wallet_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          commission_context?: string
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          from_wallet_id?: string | null
          id?: string
          processed_at?: string | null
          ride_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          tenant_id: string
          to_wallet_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          commission_context?: string
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          from_wallet_id?: string | null
          id?: string
          processed_at?: string | null
          ride_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          tenant_id?: string
          to_wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_group_invites: {
        Row: {
          created_at: string
          created_by: string | null
          direction: Database["public"]["Enums"]["invite_direction"]
          driver_id: string
          expires_at: string | null
          id: string
          message: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["invite_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          direction: Database["public"]["Enums"]["invite_direction"]
          driver_id: string
          expires_at?: string | null
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invite_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          direction?: Database["public"]["Enums"]["invite_direction"]
          driver_id?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invite_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_group_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          accepting_bookings: boolean
          alert_sound: string
          avatar_url: string | null
          bio: string | null
          cashback_pct: number | null
          cover_url: string | null
          created_at: string
          credential_number: string | null
          credential_type: string | null
          credential_verified: boolean
          custom_base_fare: number | null
          custom_price_per_km: number | null
          custom_price_per_min: number | null
          dispatch_mode: Database["public"]["Enums"]["dispatch_mode"] | null
          handle: string | null
          id: string
          is_online: boolean
          is_verified: boolean
          primary_service_category_id: string | null
          professional_type: string
          referral_code: string | null
          service_categories: string[]
          slug: string
          tenant_id: string | null
          tribe_setup_pending: boolean
          updated_at: string
          vehicle_color: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: number | null
        }
        Insert: {
          accepting_bookings?: boolean
          alert_sound?: string
          avatar_url?: string | null
          bio?: string | null
          cashback_pct?: number | null
          cover_url?: string | null
          created_at?: string
          credential_number?: string | null
          credential_type?: string | null
          credential_verified?: boolean
          custom_base_fare?: number | null
          custom_price_per_km?: number | null
          custom_price_per_min?: number | null
          dispatch_mode?: Database["public"]["Enums"]["dispatch_mode"] | null
          handle?: string | null
          id: string
          is_online?: boolean
          is_verified?: boolean
          primary_service_category_id?: string | null
          professional_type?: string
          referral_code?: string | null
          service_categories?: string[]
          slug: string
          tenant_id?: string | null
          tribe_setup_pending?: boolean
          updated_at?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
        }
        Update: {
          accepting_bookings?: boolean
          alert_sound?: string
          avatar_url?: string | null
          bio?: string | null
          cashback_pct?: number | null
          cover_url?: string | null
          created_at?: string
          credential_number?: string | null
          credential_type?: string | null
          credential_verified?: boolean
          custom_base_fare?: number | null
          custom_price_per_km?: number | null
          custom_price_per_min?: number | null
          dispatch_mode?: Database["public"]["Enums"]["dispatch_mode"] | null
          handle?: string | null
          id?: string
          is_online?: boolean
          is_verified?: boolean
          primary_service_category_id?: string | null
          professional_type?: string
          referral_code?: string | null
          service_categories?: string[]
          slug?: string
          tenant_id?: string | null
          tribe_setup_pending?: boolean
          updated_at?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_primary_service_category_id_fkey"
            columns: ["primary_service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_passengers: {
        Row: {
          created_at: string
          full_name: string
          id: string
          tenant_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          tenant_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          tenant_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_passengers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          amount_won: number | null
          assigned_driver_id: string | null
          created_at: string
          full_name: string
          id: string
          notes: string | null
          service_category_id: string | null
          source_driver_id: string | null
          status: string
          tenant_id: string | null
          updated_at: string
          whatsapp: string
          won_at: string | null
        }
        Insert: {
          amount_won?: number | null
          assigned_driver_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          service_category_id?: string | null
          source_driver_id?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          whatsapp: string
          won_at?: string | null
        }
        Update: {
          amount_won?: number | null
          assigned_driver_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          service_category_id?: string | null
          source_driver_id?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          whatsapp?: string
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_driver_id_fkey"
            columns: ["source_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      passenger_favorites: {
        Row: {
          address: string
          created_at: string
          id: string
          label: string
          lat: number
          lng: number
          passenger_id: string
          tenant_id: string
          type: Database["public"]["Enums"]["favorite_type"]
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          label: string
          lat: number
          lng: number
          passenger_id: string
          tenant_id: string
          type?: Database["public"]["Enums"]["favorite_type"]
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          label?: string
          lat?: number
          lng?: number
          passenger_id?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["favorite_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "passenger_favorites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      passengers: {
        Row: {
          cashback_balance: number
          created_at: string
          first_ride_at: string | null
          id: string
          last_ride_at: string | null
          origin_affiliate_id: string | null
          origin_driver_id: string | null
          origin_source: string | null
          tenant_id: string
          total_rides: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          cashback_balance?: number
          created_at?: string
          first_ride_at?: string | null
          id: string
          last_ride_at?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_source?: string | null
          tenant_id: string
          total_rides?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          cashback_balance?: number
          created_at?: string
          first_ride_at?: string | null
          id?: string
          last_ride_at?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_source?: string | null
          tenant_id?: string
          total_rides?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "passengers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passengers_origin_affiliate_id_fkey"
            columns: ["origin_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passengers_origin_driver_id_fkey"
            columns: ["origin_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passengers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          pix_key: string | null
          pix_key_type: Database["public"]["Enums"]["pix_key_type"] | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: Database["public"]["Enums"]["payout_status"]
          tenant_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          pix_key?: string | null
          pix_key_type?: Database["public"]["Enums"]["pix_key_type"] | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"]
          tenant_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          pix_key?: string | null
          pix_key_type?: Database["public"]["Enums"]["pix_key_type"] | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"]
          tenant_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          max_drivers: number
          name: string
          price_monthly: number
          price_signup: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          max_drivers?: number
          name: string
          price_monthly?: number
          price_signup?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          max_drivers?: number
          name?: string
          price_monthly?: number
          price_signup?: number
          updated_at?: string
        }
        Relationships: []
      }
      professional_availability: {
        Row: {
          buffer_minutes: number
          created_at: string
          day_of_week: number
          driver_id: string
          end_time: string
          id: string
          is_active: boolean
          slot_duration_minutes: number
          start_time: string
          tenant_id: string
        }
        Insert: {
          buffer_minutes?: number
          created_at?: string
          day_of_week: number
          driver_id: string
          end_time: string
          id?: string
          is_active?: boolean
          slot_duration_minutes?: number
          start_time: string
          tenant_id: string
        }
        Update: {
          buffer_minutes?: number
          created_at?: string
          day_of_week?: number
          driver_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          slot_duration_minutes?: number
          start_time?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_availability_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_availability_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_credentials: {
        Row: {
          created_at: string
          credential_number: string
          credential_type: string
          driver_id: string
          id: string
          issuing_body: string | null
          status: string
          uf: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          credential_number: string
          credential_type: string
          driver_id: string
          id?: string
          issuing_body?: string | null
          status?: string
          uf?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          credential_number?: string
          credential_type?: string
          driver_id?: string
          id?: string
          issuing_body?: string | null
          status?: string
          uf?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_credentials_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_credentials_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_team_members: {
        Row: {
          created_at: string
          headline: string | null
          id: string
          member_driver_id: string
          ordem: number
          owner_driver_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          headline?: string | null
          id?: string
          member_driver_id: string
          ordem?: number
          owner_driver_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          headline?: string | null
          id?: string
          member_driver_id?: string
          ordem?: number
          owner_driver_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_time_off: {
        Row: {
          all_day: boolean
          created_at: string
          driver_id: string
          ends_at: string
          id: string
          reason: string | null
          starts_at: string
          tenant_id: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          driver_id: string
          ends_at: string
          id?: string
          reason?: string | null
          starts_at: string
          tenant_id: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          driver_id?: string
          ends_at?: string
          id?: string
          reason?: string | null
          starts_at?: string
          tenant_id?: string
        }
        Relationships: []
      }
      recruitment_monthly_payouts: {
        Row: {
          amount: number
          ano_mes: string
          commission_id: string | null
          created_at: string
          id: string
          recruited_id: string
          recruiter_id: string
          referral_id: string
          tenant_id: string
          wallet_transaction_id: string | null
        }
        Insert: {
          amount: number
          ano_mes: string
          commission_id?: string | null
          created_at?: string
          id?: string
          recruited_id: string
          recruiter_id: string
          referral_id: string
          tenant_id: string
          wallet_transaction_id?: string | null
        }
        Update: {
          amount?: number
          ano_mes?: string
          commission_id?: string | null
          created_at?: string
          id?: string
          recruited_id?: string
          recruiter_id?: string
          referral_id?: string
          tenant_id?: string
          wallet_transaction_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          monthly_commission_active: boolean
          referral_type: Database["public"]["Enums"]["referral_type"]
          referred_id: string
          referrer_id: string
          signup_commission_amount: number | null
          signup_commission_paid: boolean
          tenant_id: string
          total_monthly_earned: number
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_commission_active?: boolean
          referral_type: Database["public"]["Enums"]["referral_type"]
          referred_id: string
          referrer_id: string
          signup_commission_amount?: number | null
          signup_commission_paid?: boolean
          tenant_id: string
          total_monthly_earned?: number
        }
        Update: {
          created_at?: string
          id?: string
          monthly_commission_active?: boolean
          referral_type?: Database["public"]["Enums"]["referral_type"]
          referred_id?: string
          referrer_id?: string
          signup_commission_amount?: number | null
          signup_commission_paid?: boolean
          tenant_id?: string
          total_monthly_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          driver_id: string
          id: string
          module: string
          passenger_id: string
          rating: number
          ride_id: string
          tenant_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          driver_id: string
          id?: string
          module?: string
          passenger_id: string
          rating: number
          ride_id: string
          tenant_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          module?: string
          passenger_id?: string
          rating?: number
          ride_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_dispatches: {
        Row: {
          attempt_number: number
          dispatched_at: string
          driver_id: string
          id: string
          responded_at: string | null
          response: Database["public"]["Enums"]["dispatch_response"]
          ride_request_id: string
          tenant_id: string
        }
        Insert: {
          attempt_number?: number
          dispatched_at?: string
          driver_id: string
          id?: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["dispatch_response"]
          ride_request_id: string
          tenant_id: string
        }
        Update: {
          attempt_number?: number
          dispatched_at?: string
          driver_id?: string
          id?: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["dispatch_response"]
          ride_request_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_dispatches_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_dispatches_ride_request_id_fkey"
            columns: ["ride_request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_dispatches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          created_at: string
          dest_address: string | null
          dest_lat: number | null
          dest_lng: number | null
          distance_km: number | null
          estimated_min: number | null
          final_price: number | null
          guest_passenger_id: string | null
          id: string
          offered_price: number | null
          origin_address: string | null
          origin_affiliate_id: string | null
          origin_driver_id: string | null
          origin_lat: number | null
          origin_lng: number | null
          origin_type: Database["public"]["Enums"]["ride_origin_type"] | null
          passenger_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["ride_status"]
          suggested_price: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dest_address?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          distance_km?: number | null
          estimated_min?: number | null
          final_price?: number | null
          guest_passenger_id?: string | null
          id?: string
          offered_price?: number | null
          origin_address?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_type?: Database["public"]["Enums"]["ride_origin_type"] | null
          passenger_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["ride_status"]
          suggested_price?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dest_address?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          distance_km?: number | null
          estimated_min?: number | null
          final_price?: number | null
          guest_passenger_id?: string | null
          id?: string
          offered_price?: number | null
          origin_address?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_type?: Database["public"]["Enums"]["ride_origin_type"] | null
          passenger_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["ride_status"]
          suggested_price?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_guest_passenger_id_fkey"
            columns: ["guest_passenger_id"]
            isOneToOne: false
            referencedRelation: "guest_passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_origin_affiliate_id_fkey"
            columns: ["origin_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_origin_driver_id_fkey"
            columns: ["origin_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          cashback_amount: number | null
          completed_at: string | null
          created_at: string
          driver_comment: string | null
          driver_id: string
          driver_rating: number | null
          guest_passenger_id: string | null
          id: string
          is_transbordo: boolean
          origin_affiliate_id: string | null
          origin_driver_id: string | null
          passenger_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          price_paid: number | null
          ride_request_id: string
          started_at: string | null
          tenant_id: string
        }
        Insert: {
          cashback_amount?: number | null
          completed_at?: string | null
          created_at?: string
          driver_comment?: string | null
          driver_id: string
          driver_rating?: number | null
          guest_passenger_id?: string | null
          id?: string
          is_transbordo?: boolean
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          passenger_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          price_paid?: number | null
          ride_request_id: string
          started_at?: string | null
          tenant_id: string
        }
        Update: {
          cashback_amount?: number | null
          completed_at?: string | null
          created_at?: string
          driver_comment?: string | null
          driver_id?: string
          driver_rating?: number | null
          guest_passenger_id?: string | null
          id?: string
          is_transbordo?: boolean
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          passenger_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          price_paid?: number | null
          ride_request_id?: string
          started_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_guest_passenger_id_fkey"
            columns: ["guest_passenger_id"]
            isOneToOne: false
            referencedRelation: "guest_passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_origin_affiliate_id_fkey"
            columns: ["origin_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_origin_driver_id_fkey"
            columns: ["origin_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_ride_request_id_fkey"
            columns: ["ride_request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_booking_addresses: {
        Row: {
          bairro: string | null
          booking_id: string
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          numero: string | null
          referencia: string | null
          tenant_id: string
          uf: string | null
        }
        Insert: {
          bairro?: string | null
          booking_id: string
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null
          referencia?: string | null
          tenant_id: string
          uf?: string | null
        }
        Update: {
          bairro?: string | null
          booking_id?: string
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null
          referencia?: string | null
          tenant_id?: string
          uf?: string | null
        }
        Relationships: []
      }
      service_booking_messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          guest_id: string | null
          id: string
          read_at: string | null
          sender_id: string | null
          sender_role: string
          tenant_id: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          guest_id?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_role: string
          tenant_id: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_role?: string
          tenant_id?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          briefing: Json
          client_id: string | null
          created_at: string
          driver_id: string
          duration_minutes: number
          factors_snapshot: Json | null
          guest_passenger_id: string | null
          id: string
          is_coverage: boolean
          notes: string | null
          origin_affiliate_id: string | null
          origin_driver_id: string | null
          origin_service_id: string | null
          payment_method: string
          price_agreed: number
          reminder_sent_1h: boolean
          reminder_sent_24h: boolean
          return_reminder_date: string | null
          scheduled_at: string
          service_type_id: string
          status: string
          tenant_id: string
          total_price: number | null
          travel_fee: number
          updated_at: string
        }
        Insert: {
          briefing?: Json
          client_id?: string | null
          created_at?: string
          driver_id: string
          duration_minutes: number
          factors_snapshot?: Json | null
          guest_passenger_id?: string | null
          id?: string
          is_coverage?: boolean
          notes?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_service_id?: string | null
          payment_method?: string
          price_agreed: number
          reminder_sent_1h?: boolean
          reminder_sent_24h?: boolean
          return_reminder_date?: string | null
          scheduled_at: string
          service_type_id: string
          status?: string
          tenant_id: string
          total_price?: number | null
          travel_fee?: number
          updated_at?: string
        }
        Update: {
          briefing?: Json
          client_id?: string | null
          created_at?: string
          driver_id?: string
          duration_minutes?: number
          factors_snapshot?: Json | null
          guest_passenger_id?: string | null
          id?: string
          is_coverage?: boolean
          notes?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_service_id?: string | null
          payment_method?: string
          price_agreed?: number
          reminder_sent_1h?: boolean
          reminder_sent_24h?: boolean
          return_reminder_date?: string | null
          scheduled_at?: string
          service_type_id?: string
          status?: string
          tenant_id?: string
          total_price?: number | null
          travel_fee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_guest_passenger_id_fkey"
            columns: ["guest_passenger_id"]
            isOneToOne: false
            referencedRelation: "guest_passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_origin_affiliate_id_fkey"
            columns: ["origin_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_origin_driver_id_fkey"
            columns: ["origin_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_payments: {
        Row: {
          amount: number
          booking_id: string
          client_id: string | null
          created_at: string
          driver_id: string
          id: string
          paid_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          client_id?: string | null
          created_at?: string
          driver_id: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          client_id?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_portfolio_items: {
        Row: {
          caption: string | null
          created_at: string
          driver_id: string
          id: string
          image_url: string
          ordem: number
          service_type_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          driver_id: string
          id?: string
          image_url: string
          ordem?: number
          service_type_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          image_url?: string
          ordem?: number
          service_type_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_pricing_factors: {
        Row: {
          created_at: string
          default_value: number | null
          driver_id: string
          id: string
          input_type: string
          key: string
          label: string
          max_value: number | null
          min_value: number | null
          options: Json | null
          ordem: number
          required: boolean
          service_type_id: string
          step: number
          tenant_id: string
          unit: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_value?: number | null
          driver_id: string
          id?: string
          input_type: string
          key: string
          label: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          ordem?: number
          required?: boolean
          service_type_id: string
          step?: number
          tenant_id: string
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_value?: number | null
          driver_id?: string
          id?: string
          input_type?: string
          key?: string
          label?: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          ordem?: number
          required?: boolean
          service_type_id?: string
          step?: number
          tenant_id?: string
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_quote_dispatches: {
        Row: {
          dispatched_at: string
          driver_id: string
          id: string
          request_id: string
          responded_at: string | null
          response: Database["public"]["Enums"]["quote_dispatch_response"]
          tenant_id: string
        }
        Insert: {
          dispatched_at?: string
          driver_id: string
          id?: string
          request_id: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["quote_dispatch_response"]
          tenant_id: string
        }
        Update: {
          dispatched_at?: string
          driver_id?: string
          id?: string
          request_id?: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["quote_dispatch_response"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quote_dispatches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quote_offers: {
        Row: {
          created_at: string
          data_disponivel: string | null
          driver_id: string
          id: string
          mensagem: string | null
          prazo_dias_max: number | null
          prazo_dias_min: number | null
          request_id: string
          status: Database["public"]["Enums"]["quote_offer_status"]
          tenant_id: string
          updated_at: string
          valid_until: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          data_disponivel?: string | null
          driver_id: string
          id?: string
          mensagem?: string | null
          prazo_dias_max?: number | null
          prazo_dias_min?: number | null
          request_id: string
          status?: Database["public"]["Enums"]["quote_offer_status"]
          tenant_id: string
          updated_at?: string
          valid_until?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          data_disponivel?: string | null
          driver_id?: string
          id?: string
          mensagem?: string | null
          prazo_dias_max?: number | null
          prazo_dias_min?: number | null
          request_id?: string
          status?: Database["public"]["Enums"]["quote_offer_status"]
          tenant_id?: string
          updated_at?: string
          valid_until?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_quote_offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quote_questions: {
        Row: {
          ajuda: string | null
          condicional: Json | null
          created_at: string
          id: string
          key: string
          label: string
          obrigatorio: boolean
          opcoes: Json | null
          ordem: number
          template_id: string
          tipo: Database["public"]["Enums"]["quote_question_type"]
        }
        Insert: {
          ajuda?: string | null
          condicional?: Json | null
          created_at?: string
          id?: string
          key: string
          label: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          template_id: string
          tipo: Database["public"]["Enums"]["quote_question_type"]
        }
        Update: {
          ajuda?: string | null
          condicional?: Json | null
          created_at?: string
          id?: string
          key?: string
          label?: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          template_id?: string
          tipo?: Database["public"]["Enums"]["quote_question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "service_quote_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "service_quote_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quote_requests: {
        Row: {
          category_id: string
          client_id: string | null
          closed_at: string | null
          contact_name: string | null
          contact_whatsapp: string | null
          created_at: string
          data_desejada: string | null
          endereco: Json | null
          endereco_lat: number | null
          endereco_lng: number | null
          expires_at: string
          fotos: string[]
          guest_passenger_id: string | null
          id: string
          max_propostas: number
          observacao: string | null
          perguntas_snapshot: Json
          respostas: Json
          service_type_id: string | null
          status: Database["public"]["Enums"]["quote_request_status"]
          template_id: string | null
          tenant_id: string
          updated_at: string
          urgencia: Database["public"]["Enums"]["quote_urgency"]
        }
        Insert: {
          category_id: string
          client_id?: string | null
          closed_at?: string | null
          contact_name?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          data_desejada?: string | null
          endereco?: Json | null
          endereco_lat?: number | null
          endereco_lng?: number | null
          expires_at?: string
          fotos?: string[]
          guest_passenger_id?: string | null
          id?: string
          max_propostas?: number
          observacao?: string | null
          perguntas_snapshot?: Json
          respostas?: Json
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["quote_request_status"]
          template_id?: string | null
          tenant_id: string
          updated_at?: string
          urgencia?: Database["public"]["Enums"]["quote_urgency"]
        }
        Update: {
          category_id?: string
          client_id?: string | null
          closed_at?: string | null
          contact_name?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          data_desejada?: string | null
          endereco?: Json | null
          endereco_lat?: number | null
          endereco_lng?: number | null
          expires_at?: string
          fotos?: string[]
          guest_passenger_id?: string | null
          id?: string
          max_propostas?: number
          observacao?: string | null
          perguntas_snapshot?: Json
          respostas?: Json
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["quote_request_status"]
          template_id?: string | null
          tenant_id?: string
          updated_at?: string
          urgencia?: Database["public"]["Enums"]["quote_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "service_quote_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "service_quote_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quote_templates: {
        Row: {
          ativo: boolean
          category_id: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          scope: Database["public"]["Enums"]["quote_template_scope"]
          service_type_id: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          category_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          scope?: Database["public"]["Enums"]["quote_template_scope"]
          service_type_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          category_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          scope?: Database["public"]["Enums"]["quote_template_scope"]
          service_type_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_reminders: {
        Row: {
          booking_id: string | null
          client_id: string | null
          created_at: string
          driver_id: string
          id: string
          message: string | null
          remind_at: string
          sent_at: string | null
          status: string
        }
        Insert: {
          booking_id?: string | null
          client_id?: string | null
          created_at?: string
          driver_id: string
          id?: string
          message?: string | null
          remind_at: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          booking_id?: string | null
          client_id?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          message?: string | null
          remind_at?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reminders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          category_id: string | null
          created_at: string
          deposit_amount: number | null
          deposit_enabled: boolean
          deposit_percent: number | null
          description: string | null
          driver_id: string
          duration_minutes: number
          id: string
          is_active: boolean
          is_immediate: boolean
          name: string
          price: number
          pricing_mode: Database["public"]["Enums"]["service_pricing_mode"]
          requires_address: boolean
          service_radius_km: number | null
          tenant_id: string
          travel_fee_base: number
          travel_fee_per_km: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_enabled?: boolean
          deposit_percent?: number | null
          description?: string | null
          driver_id: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_immediate?: boolean
          name: string
          price: number
          pricing_mode?: Database["public"]["Enums"]["service_pricing_mode"]
          requires_address?: boolean
          service_radius_km?: number | null
          tenant_id: string
          travel_fee_base?: number
          travel_fee_per_km?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_enabled?: boolean
          deposit_percent?: number | null
          description?: string | null
          driver_id?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_immediate?: boolean
          name?: string
          price?: number
          pricing_mode?: Database["public"]["Enums"]["service_pricing_mode"]
          requires_address?: boolean
          service_radius_km?: number | null
          tenant_id?: string
          travel_fee_base?: number
          travel_fee_per_km?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          next_billing_at: string | null
          plan_id: string
          referred_by: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          next_billing_at?: string | null
          plan_id: string
          referred_by?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          next_billing_at?: string | null
          plan_id?: string
          referred_by?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_mirror_invites: {
        Row: {
          created_at: string
          id: string
          invitee_driver_id: string
          inviter_driver_id: string
          message: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["team_mirror_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_driver_id: string
          inviter_driver_id: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["team_mirror_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_driver_id?: string
          inviter_driver_id?: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["team_mirror_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_branding: {
        Row: {
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          logo_url: string | null
          primary_color: string | null
          tenant_id: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string | null
          tenant_id: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string | null
          tenant_id?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          affiliate_commission: number
          allow_driver_pricing: boolean
          allow_offers: boolean
          base_fare: number
          cashback_pct: number
          created_at: string
          dispatch_max_attempts: number
          dispatch_mode: Database["public"]["Enums"]["dispatch_mode"]
          dispatch_radius_km: number
          dispatch_timeout_sec: number
          min_fare: number
          price_per_km: number
          price_per_min: number
          quote_menu_color: string | null
          quote_menu_enabled: boolean
          quote_menu_icon: string | null
          quote_menu_label: string | null
          tenant_id: string
          timezone: string
          transbordo_commission: number
          updated_at: string
        }
        Insert: {
          affiliate_commission?: number
          allow_driver_pricing?: boolean
          allow_offers?: boolean
          base_fare?: number
          cashback_pct?: number
          created_at?: string
          dispatch_max_attempts?: number
          dispatch_mode?: Database["public"]["Enums"]["dispatch_mode"]
          dispatch_radius_km?: number
          dispatch_timeout_sec?: number
          min_fare?: number
          price_per_km?: number
          price_per_min?: number
          quote_menu_color?: string | null
          quote_menu_enabled?: boolean
          quote_menu_icon?: string | null
          quote_menu_label?: string | null
          tenant_id: string
          timezone?: string
          transbordo_commission?: number
          updated_at?: string
        }
        Update: {
          affiliate_commission?: number
          allow_driver_pricing?: boolean
          allow_offers?: boolean
          base_fare?: number
          cashback_pct?: number
          created_at?: string
          dispatch_max_attempts?: number
          dispatch_mode?: Database["public"]["Enums"]["dispatch_mode"]
          dispatch_radius_km?: number
          dispatch_timeout_sec?: number
          min_fare?: number
          price_per_km?: number
          price_per_min?: number
          quote_menu_color?: string | null
          quote_menu_enabled?: boolean
          quote_menu_icon?: string | null
          quote_menu_label?: string | null
          tenant_id?: string
          timezone?: string
          transbordo_commission?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active_modules: string[]
          created_at: string
          id: string
          is_owner_provider: boolean
          is_visible_public: boolean
          name: string
          owner_user_id: string | null
          plan_id: string | null
          service_category_id: string | null
          signup_slug: string | null
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          tribe_setup_pending: boolean
          updated_at: string
        }
        Insert: {
          active_modules?: string[]
          created_at?: string
          id?: string
          is_owner_provider?: boolean
          is_visible_public?: boolean
          name: string
          owner_user_id?: string | null
          plan_id?: string | null
          service_category_id?: string | null
          signup_slug?: string | null
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tribe_setup_pending?: boolean
          updated_at?: string
        }
        Update: {
          active_modules?: string[]
          created_at?: string
          id?: string
          is_owner_provider?: boolean
          is_visible_public?: boolean
          name?: string
          owner_user_id?: string | null
          plan_id?: string | null
          service_category_id?: string | null
          signup_slug?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tribe_setup_pending?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_members: {
        Row: {
          commission_percent: number
          created_at: string
          driver_id: string
          id: string
          is_active: boolean
          joined_at: string
          role: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          created_at?: string
          driver_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          created_at?: string
          driver_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_members_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribe_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          module: string
          reference_id: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["wallet_transaction_type"]
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          reference_id?: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["wallet_transaction_type"]
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          reference_id?: string | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["wallet_transaction_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          blocked_balance: number
          created_at: string
          id: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["wallet_owner_type"]
          tenant_id: string
          total_earned: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          balance?: number
          blocked_balance?: number
          created_at?: string
          id?: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["wallet_owner_type"]
          tenant_id: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          blocked_balance?: number
          created_at?: string
          id?: string
          owner_id?: string
          owner_type?: Database["public"]["Enums"]["wallet_owner_type"]
          tenant_id?: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _ensure_driver_wallet: {
        Args: { _driver_id: string; _tenant_id: string }
        Returns: string
      }
      _haversine_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      approve_payout: { Args: { _payout_id: string }; Returns: undefined }
      create_guest_ride_request: {
        Args: {
          _dest_address: string
          _dest_lat: number
          _dest_lng: number
          _distance_km: number
          _estimated_min: number
          _full_name: string
          _offered_price: number
          _origin_address: string
          _origin_affiliate_id?: string
          _origin_driver_id?: string
          _origin_lat: number
          _origin_lng: number
          _origin_type: Database["public"]["Enums"]["ride_origin_type"]
          _payment_method: Database["public"]["Enums"]["payment_method"]
          _suggested_price: number
          _tenant_id: string
          _whatsapp: string
        }
        Returns: Json
      }
      create_tenant_with_owner: {
        Args: { _name: string; _plan_id?: string; _slug: string }
        Returns: string
      }
      ensure_driver_profile: { Args: { _tenant_id: string }; Returns: string }
      ensure_passenger: { Args: { _tenant_id: string }; Returns: string }
      ensure_user_profile: {
        Args: { _tenant_slug: string }
        Returns: undefined
      }
      ensure_wallet: {
        Args: { _owner_type: Database["public"]["Enums"]["wallet_owner_type"] }
        Returns: string
      }
      enviar_mensagem_chat_guest: {
        Args: { _booking_id: string; _content: string; _guest_id: string }
        Returns: string
      }
      fn_join_tribe_by_signup_slug: {
        Args: { _commission_percent?: number; _signup_slug: string }
        Returns: string
      }
      fn_resolve_tribe_by_signup_slug: {
        Args: { _signup_slug: string }
        Returns: {
          owner_user_id: string
          service_category_id: string
          service_category_name: string
          service_category_slug: string
          tenant_id: string
          tenant_name: string
          tenant_slug: string
        }[]
      }
      fn_setup_tribe_for_owner: {
        Args: { _service_category_id: string; _tenant_id: string }
        Returns: string
      }
      generate_driver_slug: {
        Args: { _full_name: string; _tenant_id: string }
        Returns: string
      }
      generate_handle: { Args: { _full_name: string }; Returns: string }
      generate_signup_slug: { Args: { _base: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      is_root_admin: { Args: { _user_id: string }; Returns: boolean }
      listar_mensagens_chat_guest: {
        Args: { _booking_id: string; _guest_id: string }
        Returns: {
          booking_id: string
          content: string
          created_at: string
          guest_id: string | null
          id: string
          read_at: string | null
          sender_id: string | null
          sender_role: string
          tenant_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "service_booking_messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      marcar_lidas_chat_guest: {
        Args: { _booking_id: string; _guest_id: string }
        Returns: number
      }
      process_recruitment_monthly: {
        Args: never
        Returns: {
          processados: number
          total_pago: number
        }[]
      }
      process_ride_commission: { Args: { _ride_id: string }; Returns: Json }
      process_service_commission: {
        Args: { _booking_id: string }
        Returns: Json
      }
      reject_payout: { Args: { _payout_id: string }; Returns: undefined }
      replace_provider_availability: {
        Args: {
          _blocos: Json
          _buffer_min: number
          _driver_id: string
          _slot_min: number
          _tenant_id: string
        }
        Returns: undefined
      }
      request_driver_join: {
        Args: { _message?: string; _tenant_slug: string }
        Returns: string
      }
      request_payout: {
        Args: {
          _amount: number
          _owner_type: Database["public"]["Enums"]["wallet_owner_type"]
          _pix_key: string
          _pix_key_type: Database["public"]["Enums"]["pix_key_type"]
        }
        Returns: string
      }
      resolve_handle: {
        Args: { _handle: string }
        Returns: {
          driver_id: string
          driver_slug: string
          tenant_id: string
          tenant_slug: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "root_admin"
        | "tenant_admin"
        | "manager"
        | "driver"
        | "affiliate"
        | "passenger"
      cashback_type: "credit" | "debit"
      commission_status: "pending" | "processed" | "failed"
      commission_type:
        | "transbordo"
        | "affiliate"
        | "referral"
        | "platform"
        | "service_coverage"
        | "service_referral"
      dispatch_mode: "auto" | "manual" | "hybrid"
      dispatch_response: "pending" | "accepted" | "rejected" | "timeout"
      favorite_type: "home" | "work" | "other"
      invite_direction: "invite_from_group" | "request_from_driver"
      invite_status: "pending" | "accepted" | "rejected" | "expired"
      payment_method: "dinheiro" | "pix" | "cartao" | "saldo"
      payout_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "approved"
        | "rejected"
      pix_key_type: "cpf" | "email" | "telefone" | "aleatoria"
      quote_dispatch_response: "pending" | "accepted" | "declined" | "expired"
      quote_offer_status: "pending" | "accepted" | "declined" | "withdrawn"
      quote_question_type:
        | "single_select"
        | "multi_select"
        | "number_chips"
        | "date_chips"
        | "text_short"
        | "photo"
      quote_request_status: "open" | "closed" | "expired" | "cancelled"
      quote_template_scope: "category" | "service_type"
      quote_urgency: "agora" | "hoje" | "esta_semana" | "data_marcada"
      referral_type: "driver" | "affiliate"
      ride_origin_type: "driver_link" | "affiliate_link" | "group_link"
      ride_status:
        | "pending"
        | "dispatching"
        | "accepted"
        | "in_progress"
        | "completed"
        | "expired"
        | "cancelled"
      service_pricing_mode: "fixed" | "hourly" | "daily"
      subscription_status: "active" | "past_due" | "cancelled" | "trialing"
      team_mirror_status: "pending" | "accepted" | "declined"
      tenant_status: "active" | "inactive" | "suspended"
      user_status: "active" | "inactive" | "banned"
      wallet_owner_type: "driver" | "affiliate" | "group"
      wallet_transaction_type:
        | "ride_earning"
        | "commission_transbordo"
        | "commission_affiliate"
        | "commission_referral"
        | "pix_topup"
        | "withdrawal"
        | "subscription_fee"
        | "commission_service_coverage"
        | "commission_service_referral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "root_admin",
        "tenant_admin",
        "manager",
        "driver",
        "affiliate",
        "passenger",
      ],
      cashback_type: ["credit", "debit"],
      commission_status: ["pending", "processed", "failed"],
      commission_type: [
        "transbordo",
        "affiliate",
        "referral",
        "platform",
        "service_coverage",
        "service_referral",
      ],
      dispatch_mode: ["auto", "manual", "hybrid"],
      dispatch_response: ["pending", "accepted", "rejected", "timeout"],
      favorite_type: ["home", "work", "other"],
      invite_direction: ["invite_from_group", "request_from_driver"],
      invite_status: ["pending", "accepted", "rejected", "expired"],
      payment_method: ["dinheiro", "pix", "cartao", "saldo"],
      payout_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "approved",
        "rejected",
      ],
      pix_key_type: ["cpf", "email", "telefone", "aleatoria"],
      quote_dispatch_response: ["pending", "accepted", "declined", "expired"],
      quote_offer_status: ["pending", "accepted", "declined", "withdrawn"],
      quote_question_type: [
        "single_select",
        "multi_select",
        "number_chips",
        "date_chips",
        "text_short",
        "photo",
      ],
      quote_request_status: ["open", "closed", "expired", "cancelled"],
      quote_template_scope: ["category", "service_type"],
      quote_urgency: ["agora", "hoje", "esta_semana", "data_marcada"],
      referral_type: ["driver", "affiliate"],
      ride_origin_type: ["driver_link", "affiliate_link", "group_link"],
      ride_status: [
        "pending",
        "dispatching",
        "accepted",
        "in_progress",
        "completed",
        "expired",
        "cancelled",
      ],
      service_pricing_mode: ["fixed", "hourly", "daily"],
      subscription_status: ["active", "past_due", "cancelled", "trialing"],
      team_mirror_status: ["pending", "accepted", "declined"],
      tenant_status: ["active", "inactive", "suspended"],
      user_status: ["active", "inactive", "banned"],
      wallet_owner_type: ["driver", "affiliate", "group"],
      wallet_transaction_type: [
        "ride_earning",
        "commission_transbordo",
        "commission_affiliate",
        "commission_referral",
        "pix_topup",
        "withdrawal",
        "subscription_fee",
        "commission_service_coverage",
        "commission_service_referral",
      ],
    },
  },
} as const
