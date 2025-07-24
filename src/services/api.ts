import axios from "axios";
import type { AxiosResponse } from "axios";

const API_BASE_URL = "https://accenture-mne.ca.lyzr.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types for API requests and responses
export interface ChatMessage {
  message: string;
  feedback?: string;
  user_id?: string;
  session_id: string;
}

export interface ChatResponse {
  success: boolean;
  session_id: string;
  message: string;
  response?: string;
  agent_used?: string;
  step_name?: string;
  session_context?: SessionContext;
  agent_response?: any;
  error?: string;
}

export interface SessionContext {
  session_id: string;
  user_id?: string;
  current_prompt?: string;
  current_post?: string;
  compliance_status?: string;
  image_prompt?: string;
  generated_image?: any;
  previous_steps?: Array<{
    step_name: string;
    agent_key: string;
    success: boolean;
    response_summary?: string;
  }>;
}

export interface AdGenerationRequest {
  initial_prompt: string;
  feedback?: string;
  final?: boolean;
  user_id?: string;
  session_id?: string;
}

export interface AdGenerationResponse {
  success: boolean;
  session_id: string;
  initial_prompt: string;
  enhanced_prompt?: string;
  generated_post?: string;
  compliance_check?: string;
  image_prompt?: string;
  generated_image?: any;
  error?: string;
  brainstormer_response?: any;
  post_generator_response?: any;
  compliance_response?: any;
  image_description_response?: any;
}

export interface SessionHistoryResponse {
  success: boolean;
  sessions: Array<{
    session_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    status: string;
    current_prompt?: string;
    current_post?: string;
  }>;
  count: number;
}

// API service class
export class AdGeneratorAPI {
  /**
   * Send a message to the ad generator
   * Always uses the generate endpoint which handles full pipeline with context
   */
  static async sendMessage(
    message: string,
    sessionId?: string,
    feedback?: string,
    final: boolean = false,
    userId: string = "default_user",
  ): Promise<AdGenerationResponse> {
    const payload: any = {
      initial_prompt: message,
      feedback: feedback || "",
      user_id: userId,
    };

    // Include session_id if available (for subsequent messages)
    if (sessionId) {
      payload.session_id = sessionId;
    }

    // Only include final parameter if it's true
    if (final) {
      payload.final = true;
    }

    try {
      const response: AxiosResponse<AdGenerationResponse> = await api.post(
        "/ad-generator/generate",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error generating ad:", error);
      throw error;
    }
  }

  /**
   * Legacy method - kept for backwards compatibility
   * @deprecated Use sendMessage instead
   */
  static async sendChatMessage(
    message: string,
    sessionId?: string,
    feedback?: string,
    userId: string = "default_user",
  ): Promise<ChatResponse> {
    const result = await this.sendMessage(
      message,
      sessionId,
      feedback,
      false,
      userId,
    );
    return {
      success: result.success,
      session_id: result.session_id,
      message: result.initial_prompt,
      response: result.generated_post,
      error: result.error,
    };
  }

  /**
   * Generate a complete ad through the full pipeline
   */
  static async generateAd(
    request: AdGenerationRequest,
  ): Promise<AdGenerationResponse> {
    try {
      const response: AxiosResponse<AdGenerationResponse> = await api.post(
        "/ad-generator/chat",
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error generating ad:", error);
      throw error;
    }
  }

  /**
   * Get session context and history
   */
  static async getSessionContext(
    sessionId: string,
  ): Promise<{ success: boolean; session_context: SessionContext }> {
    try {
      const response = await api.get(`/ad-generator/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting session context:", error);
      throw error;
    }
  }

  /**
   * Get user's session history
   */
  static async getUserSessions(
    userId: string,
    limit: number = 10,
  ): Promise<SessionHistoryResponse> {
    try {
      const response: AxiosResponse<SessionHistoryResponse> = await api.get(
        `/ad-generator/sessions/${userId}?limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting user sessions:", error);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  static async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await api.get("/ad-generator/health");
      return response.data;
    } catch (error) {
      console.error("Error checking service health:", error);
      throw error;
    }
  }
}

export default AdGeneratorAPI;
