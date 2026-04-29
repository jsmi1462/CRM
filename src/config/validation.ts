export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateConfig(config: { llmApiKey: string; dbPath: string }): ConfigValidationResult {
  const errors: string[] = [];

  if (!config.llmApiKey || config.llmApiKey.trim() === '') {
    errors.push('LLM API key is required.');
  }

  if (!config.dbPath || config.dbPath.trim() === '') {
    errors.push('Database path is required.');
  } else if (!/^[a-zA-Z0-9/_. -]+$/.test(config.dbPath)) {
    errors.push('Database path contains invalid characters.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
