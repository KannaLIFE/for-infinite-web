export interface Certificate {
  name: string;
  issuer?: string;
  date?: string;
}

export const certificates: Certificate[] = [];
