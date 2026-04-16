export interface MensagemChat {
  id: string;
  ride_id: string;
  sender_id: string;
  sender_role: "passenger" | "driver";
  content: string;
  timestamp: number;
}

export type PapelChat = "passenger" | "driver";
