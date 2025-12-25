import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

// Types
export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  PARTIALLY_CAPTURED = 'partially_captured',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  CHARGEBACK = 'chargeback'
}

export enum PaymentMethod {
  PAYSTACK_CARD = 'paystack_card',
  PAYSTACK_TRANSFER = 'paystack_transfer',
  PAYSTACK_BANK = 'paystack_bank',
  PAYSTACK_USSD = 'paystack_ussd',
  PAYSTACK_QR = 'paystack_qr',
  PAYSTACK_MOBILE_MONEY = 'paystack_mobile_money',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  WALLET = 'wallet'
}

interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
  webhookSecret: string;
  timeout: number;
  retryAttempts: number;
}

interface InitializeTransactionRequest {
  email: string;
  amount: number; // in kobo (1 kobo = 0.01 NGN)
  reference: string;
  currency?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
    [key: string]: any;
  };
}

interface TransactionVerification {
  status: string;
  reference: string;
  amount: number;
  paid_at: string;
  customer: {
    id: number;
    customer_code: string;
    email: string;
  };
  authorization: {
    authorization_code: string;
    last4: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
  };
  channel: string;
  ip_address: string;
  fees: number;
  currency: string;
  gateway_response: string;
  metadata: Record<string, any>;
}

interface RefundResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    refund_amount: number;
    amount: number;
    [key: string]: any;
  };
}

interface WebhookEvent {
  event: string;
  data: Record<string, any>;
}

export class PaystackService {
  private config: PaystackConfig;
  private axiosInstance: AxiosInstance;

  constructor(config: PaystackConfig) {
    this.config = config;

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Initialize a transaction with Paystack
   */
  async initializeTransaction(data: InitializeTransactionRequest): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    try {
      const response = await this.axiosInstance.post<PaystackResponse>('/transaction/initialize', {
        email: data.email,
        amount: data.amount * 100, // Convert to kobo
        reference: data.reference,
        currency: data.currency || 'NGN',
        callback_url: data.callback_url,
        metadata: data.metadata,
        channels: data.channels || ['card', 'bank_transfer', 'ussd', 'qr']
      });

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference
      };
    } catch (error) {
      throw new Error(`Failed to initialize Paystack transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify a transaction with Paystack
   */
  async verifyTransaction(reference: string): Promise<TransactionVerification> {
    try {
      const response = await this.axiosInstance.get<{
        status: boolean;
        message: string;
        data: TransactionVerification;
      }>(`/transaction/verify/${reference}`);

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to verify Paystack transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionIdOrReference: string, amount?: number): Promise<RefundResponse> {
    try {
      const payload: any = {
        transaction: transactionIdOrReference
      };

      if (amount) {
        payload.amount = amount * 100; // Convert to kobo
      }

      const response = await this.axiosInstance.post<RefundResponse>('/refund', payload);

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | object, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.config.webhookSecret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  /**
   * Get transaction details
   */
  async getTransaction(transactionId: number | string): Promise<TransactionVerification> {
    try {
      const response = await this.axiosInstance.get<{
        status: boolean;
        message: string;
        data: TransactionVerification;
      }>(`/transaction/${transactionId}`);

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch transaction details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Charge a card using authorization code
   */
  async chargeAuthorization(data: {
    authorization_code: string;
    email: string;
    amount: number; // in kobo
    reference: string;
    metadata?: Record<string, any>;
  }): Promise<TransactionVerification> {
    try {
      const response = await this.axiosInstance.post<{
        status: boolean;
        message: string;
        data: TransactionVerification;
      }>('/transaction/charge_authorization', {
        authorization_code: data.authorization_code,
        email: data.email,
        amount: data.amount,
        reference: data.reference,
        metadata: data.metadata
      });

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to charge authorization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get list of transactions
   */
  async listTransactions(options?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
    customer?: number;
    status?: string;
  }): Promise<{
    data: TransactionVerification[];
    meta: {
      total: number;
      skipped: number;
      pagination: {
        total: number;
        current_page: number;
        per_page: number;
      };
    };
  }> {
    try {
      const response = await this.axiosInstance.get<{
        status: boolean;
        message: string;
        data: TransactionVerification[];
        meta: any;
      }>('/transaction', {
        params: {
          perPage: options?.perPage || 50,
          page: options?.page || 1,
          from: options?.from,
          to: options?.to,
          customer: options?.customer,
          status: options?.status
        }
      });

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return {
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      throw new Error(`Failed to list transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate account number for bank transfers
   */
  async validateAccount(accountNumber: string, bankCode: string): Promise<{
    account_number: string;
    account_name: string;
    bank_id: number;
  }> {
    try {
      const response = await this.axiosInstance.get<{
        status: boolean;
        message: string;
        data: {
          account_number: string;
          account_name: string;
          bank_id: number;
        };
      }>('/bank/resolve', {
        params: {
          account_number: accountNumber,
          bank_code: bankCode
        }
      });

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to validate account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get list of banks
   */
  async getBanks(): Promise<Array<{
    id: number;
    code: string;
    name: string;
  }>> {
    try {
      const response = await this.axiosInstance.get<{
        status: boolean;
        message: string;
        data: Array<{
          id: number;
          code: string;
          name: string;
        }>;
      }>('/bank');

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch banks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    id: number;
    customer_code: string;
    email: string;
    first_name: string;
    last_name: string;
  }> {
    try {
      const response = await this.axiosInstance.post<{
        status: boolean;
        message: string;
        data: {
          id: number;
          customer_code: string;
          email: string;
          first_name: string;
          last_name: string;
        };
      }>('/customer', {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        metadata: data.metadata
      });

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get customer details
   */
  async getCustomer(customerCode: string | number): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/customer/${customerCode}`);

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send OTP for verification
   */
  async sendOTP(reference: string): Promise<{
    status: boolean;
    message: string;
  }> {
    try {
      const response = await this.axiosInstance.post<{
        status: boolean;
        message: string;
      }>('/charge', {
        reference
      });

      return {
        status: response.data.status,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(`Failed to send OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(reference: string, otp: string): Promise<TransactionVerification> {
    try {
      const response = await this.axiosInstance.post<{
        status: boolean;
        message: string;
        data: TransactionVerification;
      }>('/charge/submit_otp', {
        reference,
        otp
      });

      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export instances
export const createPaystackService = (config: Partial<PaystackConfig>): PaystackService => {
  const defaultConfig: PaystackConfig = {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
    timeout: 30000,
    retryAttempts: 3
  };

  return new PaystackService({ ...defaultConfig, ...config });
};

export default PaystackService;
