// Hybrid secrets management: Vault-first, environment fallback
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VaultSecret {
  [key: string]: string;
}

class SecretsManager {
  private cache: Map<string, VaultSecret> = new Map();
  private vaultAvailable: boolean | null = null;

  async checkVaultAvailability(): Promise<boolean> {
    if (this.vaultAvailable !== null) {
      return this.vaultAvailable;
    }

    try {
      // Check if vault command exists and we have a token
      if (!process.env.VAULT_TOKEN) {
        console.log('🔐 No VAULT_TOKEN found, using environment variables');
        this.vaultAvailable = false;
        return false;
      }

      // Test vault connection
      await execAsync('vault status', {
        env: {
          ...process.env,
          VAULT_ADDR: process.env.VAULT_ADDR || 'http://127.0.0.1:8200'
        }
      });

      console.log('🔐 Vault available, will use for secrets');
      this.vaultAvailable = true;
      return true;
    } catch {
      console.log('🔐 Vault unavailable, falling back to environment variables');
      this.vaultAvailable = false;
      return false;
    }
  }

  async getVaultSecret(path: string): Promise<VaultSecret | null> {
    try {
      const cacheKey = path;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const { stdout } = await execAsync(`vault kv get -format=json ${path}`, {
        env: {
          ...process.env,
          VAULT_ADDR: process.env.VAULT_ADDR || 'http://127.0.0.1:8200'
        }
      });

      const vaultResponse = JSON.parse(stdout);
      const secrets = vaultResponse.data?.data || {};

      // Cache for 5 minutes
      this.cache.set(cacheKey, secrets);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

      return secrets;
    } catch {
      console.error(`Failed to get Vault secret from ${path}`);
      return null;
    }
  }

  async getSecret(vaultPath: string, vaultKey: string, envKey: string): Promise<string | undefined> {
    // Try Vault first (only if available)
    if (await this.checkVaultAvailability()) {
      try {
        const secrets = await this.getVaultSecret(vaultPath);
        if (secrets && secrets[vaultKey]) {
          return secrets[vaultKey];
        }
      } catch {
        console.warn(`Vault lookup failed for ${vaultPath}:${vaultKey}, falling back to environment`);
      }
    }

    // Fallback to environment variable
    return process.env[envKey];
  }

  async getSupabaseConfig() {
    const [url, serviceKey, anonKey] = await Promise.all([
      this.getSecret('secret/supabase', 'url', 'SUPABASE_URL'),
      this.getSecret('secret/supabase', 'service_role_key', 'SUPABASE_SERVICE_ROLE_KEY'),
      this.getSecret('secret/supabase', 'anon_key', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    ]);

    return { url, serviceKey, anonKey };
  }

  async getJWTSecret(): Promise<string | undefined> {
    return this.getSecret('secret/jwt', 'access_token_secret', 'JWT_SECRET');
  }
}

// Singleton instance
export const secretsManager = new SecretsManager();