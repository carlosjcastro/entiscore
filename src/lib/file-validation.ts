import { fileTypeFromBuffer } from "file-type";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const ALLOWED_TEXT_EXTENSIONS = [".txt", ".html", ".htm", ".md", ".markdown"];

const BLOCKED_COMPRESSED_EXTENSIONS = [".zip", ".rar", ".7z", ".gz", ".tar", ".bz2"];

const ALLOWED_MIME_TYPES_BY_MAGIC = new Set([
  "text/html",
  "application/xhtml+xml",
]);

interface FileValidationSuccess {
  valid: true;
  content: string;
}

interface FileValidationFailure {
  valid: false;
  reason: string;
}

export type FileValidationResult = FileValidationSuccess | FileValidationFailure;

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

function isCompressedExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return BLOCKED_COMPRESSED_EXTENSIONS.includes(extension);
}

function isAllowedExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ALLOWED_TEXT_EXTENSIONS.includes(extension);
}

function isLikelyTextContent(buffer: Buffer): boolean {
  const sampleSize = Math.min(buffer.length, 8192);
  let nonPrintableCount = 0;

  for (let i = 0; i < sampleSize; i++) {
    const byte = buffer[i]!;
    if (byte === 0) return false;
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      nonPrintableCount++;
    }
  }

  return nonPrintableCount / sampleSize < 0.05;
}

export async function validateAndExtractFileContent(
  fileBuffer: Buffer,
  filename: string
): Promise<FileValidationResult> {
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      reason: `El archivo supera el límite de 2 MB (tamaño: ${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB)`,
    };
  }

  if (isCompressedExtension(filename)) {
    return {
      valid: false,
      reason: "Los archivos comprimidos no están permitidos",
    };
  }

  if (!isAllowedExtension(filename)) {
    return {
      valid: false,
      reason: "Solo se permiten archivos de texto plano (.txt), HTML (.html) o Markdown (.md)",
    };
  }

  const detectedType = await fileTypeFromBuffer(fileBuffer);

  if (detectedType) {
    if (!ALLOWED_MIME_TYPES_BY_MAGIC.has(detectedType.mime)) {
      return {
        valid: false,
        reason: `El contenido real del archivo es de tipo ${detectedType.mime}, que no está permitido. Solo se aceptan texto plano, HTML y Markdown.`,
      };
    }
  }

  if (!isLikelyTextContent(fileBuffer)) {
    return {
      valid: false,
      reason: "El archivo no parece contener texto legible. Solo se aceptan archivos de texto plano, HTML o Markdown.",
    };
  }

  try {
    const content = fileBuffer.toString("utf-8");
    return { valid: true, content };
  } catch {
    return {
      valid: false,
      reason: "No se pudo leer el contenido del archivo correctamente",
    };
  }
}
