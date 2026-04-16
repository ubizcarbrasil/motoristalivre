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
      commissions: {
        Row: {
          amount: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at: string
          from_wallet_id: string | null
          id: string
          processed_at: string | null
          ride_id: string
          status: Database["public"]["Enums"]["commission_status"]
          tenant_id: string
          to_wallet_id: string | null
        }
        Insert: {
          amount: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          from_wallet_id?: string | null
          id?: string
          processed_at?: string | null
          ride_id: string
          status?: Database["public"]["Enums"]["commission_status"]
          tenant_id: string
          to_wallet_id?: string | null
        }
        Update: {
          amount?: number
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          from_wallet_id?: string | null
          id?: string
          processed_at?: string | null
          ride_id?: string
          status?: Database["public"]["Enums"]["commission_status"]
          tenant_id?: string
          to_wallet_id?: string | null
        }
        Relationships: [
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
          bio: string | null
          cashback_pct: number | null
          cover_url: string | null
          created_at: string
          custom_base_fare: number | null
          custom_price_per_km: number | null
          custom_price_per_min: number | null
          dispatch_mode: Database["public"]["Enums"]["dispatch_mode"] | null
          id: string
          is_online: boolean
          is_verified: boolean
          referral_code: string | null
          slug: string
          tenant_id: string
          updated_at: string
          vehicle_color: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: number | null
        }
        Insert: {
          bio?: string | null
          cashback_pct?: number | null
          cover_url?: string | null
          created_at?: string
          custom_base_fare?: number | null
          custom_price_per_km?: number | null
          custom_price_per_min?: number | null
          dispatch_mode?: Database["public"]["Enums"]["dispatch_mode"] | null
          id: string
          is_online?: boolean
          is_verified?: boolean
          referral_code?: string | null
          slug: string
          tenant_id: string
          updated_at?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
        }
        Update: {
          bio?: string | null
          cashback_pct?: number | null
          cover_url?: string | null
          created_at?: string
          custom_base_fare?: number | null
          custom_price_per_km?: number | null
          custom_price_per_min?: number | null
          dispatch_mode?: Database["public"]["Enums"]["dispatch_mode"] | null
          id?: string
          is_online?: boolean
          is_verified?: boolean
          referral_code?: string | null
          slug?: string
          tenant_id?: string
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
            foreignKeyName: "drivers_tenant_id_fkey"
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
          id: string
          offered_price: number | null
          origin_address: string | null
          origin_affiliate_id: string | null
          origin_driver_id: string | null
          origin_lat: number | null
          origin_lng: number | null
          origin_type: Database["public"]["Enums"]["ride_origin_type"] | null
          passenger_id: string
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
          id?: string
          offered_price?: number | null
          origin_address?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_type?: Database["public"]["Enums"]["ride_origin_type"] | null
          passenger_id: string
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
          id?: string
          offered_price?: number | null
          origin_address?: string | null
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_type?: Database["public"]["Enums"]["ride_origin_type"] | null
          passenger_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["ride_status"]
          suggested_price?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
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
          id: string
          is_transbordo: boolean
          origin_affiliate_id: string | null
          origin_driver_id: string | null
          passenger_id: string
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
          id?: string
          is_transbordo?: boolean
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          passenger_id: string
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
          id?: string
          is_transbordo?: boolean
          origin_affiliate_id?: string | null
          origin_driver_id?: string | null
          passenger_id?: string
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
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
          created_at: string
          id: string
          name: string
          owner_user_id: string | null
          plan_id: string | null
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id?: string | null
          plan_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string | null
          plan_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
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
      approve_payout: { Args: { _payout_id: string }; Returns: undefined }
      create_tenant_with_owner: {
        Args: { _name: string; _plan_id?: string; _slug: string }
        Returns: string
      }
      ensure_user_profile: {
        Args: { _tenant_slug: string }
        Returns: undefined
      }
      ensure_wallet: {
        Args: { _owner_type: Database["public"]["Enums"]["wallet_owner_type"] }
        Returns: string
      }
      generate_driver_slug: {
        Args: { _full_name: string; _tenant_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      is_root_admin: { Args: { _user_id: string }; Returns: boolean }
      process_ride_commission: { Args: { _ride_id: string }; Returns: Json }
      reject_payout: { Args: { _payout_id: string }; Returns: undefined }
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
      commission_type: "transbordo" | "affiliate" | "referral" | "platform"
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
      subscription_status: "active" | "past_due" | "cancelled" | "trialing"
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
      commission_type: ["transbordo", "affiliate", "referral", "platform"],
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
      subscription_status: ["active", "past_due", "cancelled", "trialing"],
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
      ],
    },
  },
} as const
