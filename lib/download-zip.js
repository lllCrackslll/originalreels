import JSZip from "jszip";

/**
 * Télécharge plusieurs fichiers dans une archive .zip
 * @param {{ name: string, blob: Blob }[]} files
 * @param {string} zipName
 */
export async function downloadAsZip(files, zipName = "originalreels-pack.zip") {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.blob);
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(url);
}
