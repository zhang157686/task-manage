/**
 * AI Models related types
 */

export interface AIModel {
  id: number;
  user_id: number;
  name: string;
  provider: string;
  model_id: string;
  api_key: string; // Will be masked in responses
  api_base_url?: string;
  config: ModelConfig;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelConfig {
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  [key: string]: any;
}

export interface AIModelCreate {
  name: string;
  provider: string;
  model_id: string;
  api_key: string;
  api_base_url?: string;
  config?: ModelConfig;
  is_active?: boolean;
  is_default?: boolean;
}

export interface AIModelUpdate {
  name?: string;
  provider?: string;
  model_id?: string;
  api_key?: string;
  api_base_url?: string;
  config?: ModelConfig;
  is_active?: boolean;
  is_default?: boolean;
}

export interface AIModelTestRequest {
  test_message?: string;
}

export interface AIModelTestResponse {
  success: boolean;
  message: string;
  response_time?: number;
  model_response?: string;
  error?: string;
}

export type ModelProvider = 'openai' | 'anthropic' | 'azure' | 'custom';

export interface ModelProviderInfo {
  id: ModelProvider;
  name: string;
  description: string;
  defaultBaseUrl?: string;
  supportedModels: string[];
  configFields: ModelConfigField[];
}

export interface ModelConfigField {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
}

// Predefined model providers
export const MODEL_PROVIDERS: ModelProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI GPT models',
    defaultBaseUrl: 'https://api.openai.com/v1',
    supportedModels: [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ],
    configFields: [
      {
        key: 'max_tokens',
        label: 'Max Tokens',
        type: 'number',
        description: 'Maximum number of tokens to generate',
        min: 1,
        max: 4096,
        defaultValue: 1000,
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        description: 'Controls randomness (0.0 to 2.0)',
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 0.7,
      },
      {
        key: 'top_p',
        label: 'Top P',
        type: 'number',
        description: 'Nucleus sampling parameter',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 1,
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Anthropic Claude models',
    defaultBaseUrl: 'https://api.anthropic.com',
    supportedModels: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
    ],
    configFields: [
      {
        key: 'max_tokens',
        label: 'Max Tokens',
        type: 'number',
        description: 'Maximum number of tokens to generate',
        min: 1,
        max: 4096,
        defaultValue: 1000,
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        description: 'Controls randomness (0.0 to 1.0)',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.7,
      },
    ],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    description: 'Azure OpenAI Service',
    supportedModels: [
      'gpt-4',
      'gpt-4-32k',
      'gpt-35-turbo',
      'gpt-35-turbo-16k',
    ],
    configFields: [
      {
        key: 'max_tokens',
        label: 'Max Tokens',
        type: 'number',
        description: 'Maximum number of tokens to generate',
        min: 1,
        max: 4096,
        defaultValue: 1000,
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        description: 'Controls randomness (0.0 to 2.0)',
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 0.7,
      },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    description: 'Custom OpenAI-compatible API',
    supportedModels: [],
    configFields: [
      {
        key: 'max_tokens',
        label: 'Max Tokens',
        type: 'number',
        description: 'Maximum number of tokens to generate',
        min: 1,
        max: 8192,
        defaultValue: 1000,
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        description: 'Controls randomness',
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 0.7,
      },
    ],
  },
];