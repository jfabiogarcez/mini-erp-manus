import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Endpoint para upload de arquivos para S3
 * POST /api/upload
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const file = req.file;
    const fileName = `uploads/${Date.now()}-${file.originalname}`;

    // Upload para S3
    const result = await storagePut(fileName, file.buffer, file.mimetype);

    res.json({
      url: result.url,
      key: result.key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    console.error("[Upload] Erro ao fazer upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
  }
});

export default router;
