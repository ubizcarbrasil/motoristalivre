export interface ItemPortfolio {
  id: string;
  driver_id: string;
  service_type_id: string;
  image_url: string;
  caption: string | null;
  ordem: number;
}

export interface MembroEquipe {
  id: string;
  owner_driver_id: string;
  member_driver_id: string;
  headline: string | null;
  ordem: number;
  // dados resolvidos
  nome: string;
  avatar_url: string | null;
  slug: string;
  handle: string | null;
  is_verified: boolean;
  credential_verified: boolean;
  service_categories: string[];
  professional_type: "driver" | "service_provider" | "both";
}
