import { invokeLLM } from "./_core/llm";

/**
 * Serviço de integração com OneDrive
 * Sincroniza arquivos do Mini-ERP com OneDrive automaticamente
 */

interface OneDriveFile {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  mimeType: string;
  url?: string;
}

interface SyncMetrics {
  totalFiles: number;
  totalSize: number;
  lastSync: Date;
  filesAdded: number;
  filesUpdated: number;
  filesDeleted: number;
  syncStatus: "idle" | "syncing" | "error";
  errorMessage?: string;
}

let syncMetrics: SyncMetrics = {
  totalFiles: 0,
  totalSize: 0,
  lastSync: new Date(),
  filesAdded: 0,
  filesUpdated: 0,
  filesDeleted: 0,
  syncStatus: "idle",
};

/**
 * Inicializa conexão com OneDrive
 * Requer token de autenticação do Microsoft Graph
 */
export async function initializeOneDrive(accessToken: string): Promise<void> {
  try {
    // Validar token
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token de OneDrive inválido");
    }

    console.log("[OneDrive] Conexão estabelecida com sucesso");
  } catch (error) {
    console.error("[OneDrive] Erro ao conectar:", error);
    throw error;
  }
}

/**
 * Sincroniza arquivos com OneDrive
 */
export async function syncWithOneDrive(
  accessToken: string,
  localFiles: Array<{ name: string; data: Buffer; mimeType: string }>
): Promise<SyncMetrics> {
  syncMetrics.syncStatus = "syncing";

  try {
    const uploadedFiles: OneDriveFile[] = [];

    for (const file of localFiles) {
      try {
        // Upload para OneDrive
        const uploadResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/root:/${file.name}:/content`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": file.mimeType,
            },
            body: file.data,
          }
        );

        if (uploadResponse.ok) {
          const uploadedFile = await uploadResponse.json();
          uploadedFiles.push({
            id: uploadedFile.id,
            name: uploadedFile.name,
            path: uploadedFile.parentReference?.path || "/",
            size: uploadedFile.size,
            lastModified: new Date(uploadedFile.lastModifiedDateTime),
            mimeType: file.mimeType,
            url: uploadedFile.webUrl,
          });

          syncMetrics.filesAdded++;
        }
      } catch (error) {
        console.error(`[OneDrive] Erro ao fazer upload de ${file.name}:`, error);
      }
    }

    // Atualizar métricas
    syncMetrics.totalFiles = uploadedFiles.length;
    syncMetrics.totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    syncMetrics.lastSync = new Date();
    syncMetrics.syncStatus = "idle";

    console.log(`[OneDrive] Sincronização concluída: ${uploadedFiles.length} arquivos`);

    return syncMetrics;
  } catch (error) {
    syncMetrics.syncStatus = "error";
    syncMetrics.errorMessage = String(error);
    console.error("[OneDrive] Erro durante sincronização:", error);
    throw error;
  }
}

/**
 * Obtém lista de arquivos do OneDrive
 */
export async function listOneDriveFiles(
  accessToken: string,
  folderId: string = "root"
): Promise<OneDriveFile[]> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao listar arquivos do OneDrive");
    }

    const data = await response.json();
    const files: OneDriveFile[] = data.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      path: item.parentReference?.path || "/",
      size: item.size || 0,
      lastModified: new Date(item.lastModifiedDateTime),
      mimeType: item.file?.mimeType || "application/octet-stream",
      url: item.webUrl,
    }));

    return files;
  } catch (error) {
    console.error("[OneDrive] Erro ao listar arquivos:", error);
    throw error;
  }
}

/**
 * Baixa arquivo do OneDrive
 */
export async function downloadFromOneDrive(
  accessToken: string,
  fileId: string
): Promise<Buffer> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao baixar arquivo do OneDrive");
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error("[OneDrive] Erro ao baixar arquivo:", error);
    throw error;
  }
}

/**
 * Deleta arquivo do OneDrive
 */
export async function deleteFromOneDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao deletar arquivo do OneDrive");
    }

    syncMetrics.filesDeleted++;
    console.log("[OneDrive] Arquivo deletado com sucesso");
  } catch (error) {
    console.error("[OneDrive] Erro ao deletar arquivo:", error);
    throw error;
  }
}

/**
 * Obtém métricas de sincronização
 */
export function getSyncMetrics(): SyncMetrics {
  return syncMetrics;
}

/**
 * Reseta métricas de sincronização
 */
export function resetSyncMetrics(): void {
  syncMetrics = {
    totalFiles: 0,
    totalSize: 0,
    lastSync: new Date(),
    filesAdded: 0,
    filesUpdated: 0,
    filesDeleted: 0,
    syncStatus: "idle",
  };
}
