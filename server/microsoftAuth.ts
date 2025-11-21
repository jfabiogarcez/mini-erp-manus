/**
 * Serviço de Autenticação OAuth do Microsoft
 * Gerencia autenticação com Microsoft Graph API para OneDrive
 */

interface MicrosoftAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string;
}

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

let authConfig: MicrosoftAuthConfig | null = null;
let cachedAccessToken: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * Inicializa configuração de autenticação
 */
export function initializeMicrosoftAuth(config: MicrosoftAuthConfig): void {
  authConfig = config;
  console.log("[Microsoft Auth] Inicializado com sucesso");
}

/**
 * Gera URL de autorização para login do usuário
 */
export function getAuthorizationUrl(state?: string): string {
  if (!authConfig) {
    throw new Error("Microsoft Auth não foi inicializado");
  }

  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    response_type: "code",
    scope: "Files.ReadWrite offline_access",
    redirect_uri: authConfig.redirectUri,
    state: state || Math.random().toString(36).substring(7),
  });

  const tenant = authConfig.tenantId || "common";
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Troca código de autorização por token de acesso
 */
export async function exchangeCodeForToken(
  code: string
): Promise<AccessTokenResponse> {
  if (!authConfig) {
    throw new Error("Microsoft Auth não foi inicializado");
  }

  try {
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: authConfig.clientId,
          client_secret: authConfig.clientSecret,
          code,
          redirect_uri: authConfig.redirectUri,
          grant_type: "authorization_code",
          scope: "Files.ReadWrite offline_access",
        }).toString(),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao trocar código por token");
    }

    const tokenData: AccessTokenResponse = await response.json();

    // Cachear token
    cachedAccessToken = {
      token: tokenData.access_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    console.log("[Microsoft Auth] Token obtido com sucesso");
    return tokenData;
  } catch (error) {
    console.error("[Microsoft Auth] Erro ao trocar código:", error);
    throw error;
  }
}

/**
 * Renova token de acesso usando refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<AccessTokenResponse> {
  if (!authConfig) {
    throw new Error("Microsoft Auth não foi inicializado");
  }

  try {
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: authConfig.clientId,
          client_secret: authConfig.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: "Files.ReadWrite offline_access",
        }).toString(),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao renovar token");
    }

    const tokenData: AccessTokenResponse = await response.json();

    // Cachear novo token
    cachedAccessToken = {
      token: tokenData.access_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    console.log("[Microsoft Auth] Token renovado com sucesso");
    return tokenData;
  } catch (error) {
    console.error("[Microsoft Auth] Erro ao renovar token:", error);
    throw error;
  }
}

/**
 * Obtém perfil do usuário autenticado
 */
export async function getUserProfile(
  accessToken: string
): Promise<UserProfile> {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao obter perfil do usuário");
    }

    const profile: UserProfile = await response.json();
    console.log("[Microsoft Auth] Perfil obtido:", profile.displayName);
    return profile;
  } catch (error) {
    console.error("[Microsoft Auth] Erro ao obter perfil:", error);
    throw error;
  }
}

/**
 * Valida se token está ainda válido
 */
export function isTokenValid(): boolean {
  if (!cachedAccessToken) {
    return false;
  }

  // Considerar expirado 5 minutos antes do tempo real
  const bufferTime = 5 * 60 * 1000;
  return Date.now() < cachedAccessToken.expiresAt - bufferTime;
}

/**
 * Obtém token em cache
 */
export function getCachedToken(): string | null {
  if (isTokenValid()) {
    return cachedAccessToken?.token || null;
  }
  return null;
}

/**
 * Limpa token em cache
 */
export function clearCachedToken(): void {
  cachedAccessToken = null;
  console.log("[Microsoft Auth] Token em cache removido");
}

/**
 * Valida token com Microsoft Graph
 */
export async function validateToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
