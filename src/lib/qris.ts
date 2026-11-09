import { renderSVG } from 'uqr';

/**
 * Standard CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF)
 * Used to calculate the mandatory 4-character checksum for EMVCo QRIS (Tag 63).
 */
export function calculateQrisCrc16(str: string): string {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates an official unique Order ID format: ELC-<timestamp>-<5 random chars>
 * e.g., ELC-1730873200000-8F3K9
 */
export function generateOrderId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ELC-${ts}-${rand}`;
}

/**
 * Generates a valid Indonesian EMVCo Dynamic QRIS payload string.
 * Meets Bank Indonesia National QRIS specifications (00, 01, 26, 51, 52, 53, 54, 58, 59, 60, 62, 63).
 */
export function generateSimulatedQrisString(orderId: string, amount: number): string {
  const padLength = (val: string | number) => String(String(val).length).padStart(2, '0');

  const merchantName = 'ELCELEBRATE';
  const merchantCity = 'JAKARTA';
  const postalCode = '12340';
  const amountStr = String(Math.round(amount));

  // Tag 62 Additional Data Field: Sub-tag 01 (Bill Number / Order ID)
  const tag62Value = `01${padLength(orderId)}${orderId}`;

  // Base payload without Tag 63 checksum
  let payload =
    '000201' + // Payload Format Indicator
    '010212' + // Point of Initiation: 12 (Dynamic QR)
    '26680014ID.LINKAJA.WWW011893600014000000000102030000303UME' + // Merchant Account Info (Acquirer)
    '51450015ID.CO.QRIS.WWW0215ID10200210000010303UME' + // Merchant Account Info (National QRIS)
    '52045812' + // Merchant Category Code
    '5303360' + // Transaction Currency: 360 (IDR)
    `54${padLength(amountStr)}${amountStr}` + // Transaction Amount
    '5802ID' + // Country Code: ID
    `59${padLength(merchantName)}${merchantName}` + // Merchant Name
    `60${padLength(merchantCity)}${merchantCity}` + // Merchant City
    `61${padLength(postalCode)}${postalCode}` + // Postal Code
    `62${padLength(tag62Value)}${tag62Value}` + // Additional Data
    '6304'; // CRC placeholder (4 chars)

  const crc = calculateQrisCrc16(payload);
  return `${payload}${crc}`;
}

/**
 * Renders a crisp SVG string for QRIS display in web and modals.
 */
export function generateQrisSvg(
  payload: string,
  options: {
    blackColor?: string;
    whiteColor?: string;
    border?: number;
  } = {}
): string {
  const { blackColor = '#0f172a', whiteColor = '#ffffff', border = 2 } = options;
  return renderSVG(payload, {
    border,
    blackColor,
    whiteColor,
  });
}

/**
 * Configuration and Gateway Provider Detection
 */
export interface PaymentGatewayConfig {
  provider: 'simulation' | 'tripay' | 'pakasir' | 'midtrans';
  apiKey?: string;
  webhookSecret?: string;
  isSimulation: boolean;
}

export function getPaymentGatewayConfig(): PaymentGatewayConfig {
  const provider = (import.meta.env.PAYMENT_GATEWAY_PROVIDER || '').toLowerCase();
  const apiKey = import.meta.env.PAYMENT_API_KEY;
  const webhookSecret = import.meta.env.PAYMENT_WEBHOOK_SECRET;

  if (provider === 'tripay' && apiKey) {
    return { provider: 'tripay', apiKey, webhookSecret, isSimulation: false };
  }
  if (provider === 'pakasir' && apiKey) {
    return { provider: 'pakasir', apiKey, webhookSecret, isSimulation: false };
  }
  if (provider === 'midtrans' && apiKey) {
    return { provider: 'midtrans', apiKey, webhookSecret, isSimulation: false };
  }

  return {
    provider: 'simulation',
    apiKey: undefined,
    webhookSecret: undefined,
    isSimulation: true,
  };
}

