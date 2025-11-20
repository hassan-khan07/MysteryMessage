// is ma actual response nhi hoo ga blka response kis types sa response dekhna chahiya 
//imp  ->  jab bi types define hota  hain most of times interface hi use hota ha  (basic typescript) 

import { Message } from "@/model/User";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>
};