import axios from "axios";

export interface PlaudConfig {
    clientId: string;
    secretKey: string;
}

export interface PlaudDevice {
    id: string;
    name: string;
    model: string;
}

export interface PlaudFile {
    id: string;
    name: string;
    duration: number;
    created_at: string;
    transcription?: {
        text: string;
        summary?: string;
    };
}

export class PlaudClient {
    private token: string;
    private baseUrl = "https://api.plaud.ai";

    constructor(config: PlaudConfig) {
        // Create Bearer token: base64(client_id:secret_key)
        const credentials = `${config.clientId}:${config.secretKey}`;
        this.token = Buffer.from(credentials).toString("base64");
    }

    private async request<T>(endpoint: string, options: any = {}): Promise<T> {
        try {
            const response = await axios({
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                    ...options.headers,
                },
                ...options,
            });
            return response.data;
        } catch (error: any) {
            console.error("Plaud API Error:", error.response?.data || error.message);
            throw new Error(`Plaud API Error: ${error.response?.data?.message || error.message}`);
        }
    }

    async getDevices(): Promise<PlaudDevice[]> {
        return this.request<PlaudDevice[]>("/devices/");
    }

    async getFiles(deviceId?: string): Promise<PlaudFile[]> {
        const endpoint = deviceId ? `/files/?device_id=${deviceId}` : "/files/";
        return this.request<PlaudFile[]>(endpoint);
    }

    async getFile(fileId: string): Promise<PlaudFile> {
        return this.request<PlaudFile>(`/files/${fileId}/`);
    }

    async getTranscription(fileId: string): Promise<string> {
        const file = await this.getFile(fileId);
        return file.transcription?.text || "";
    }
}
