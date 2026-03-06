export type CodeMode = 'qr' | 'barcode';

export type QRInputType =
  | 'url'
  | 'text'
  | 'contact'
  | 'wifi'
  | 'email'
  | 'sms'
  | 'phone'
  | 'location';

export type BarcodeFormatId =
  | 'CODE128'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'CODE39'
  | 'ITF14';

export interface QRTypeOption {
  id: QRInputType;
  label: string;
  emoji: string;
  description: string;
  fields: FormField[];
}

export interface FormField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'number' | 'url' | 'email' | 'tel' | 'select';
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface BarcodeFormatOption {
  id: BarcodeFormatId;
  label: string;
  description: string;
  placeholder: string;
  pattern?: RegExp;
  maxLength?: number;
}

export type FormData = Record<string, string>;

export interface HistoryItem {
  id: string;
  mode: CodeMode;
  typeOrFormat: string;
  label: string;
  encodedValue: string;
  formData: FormData;
  createdAt: string;
}
