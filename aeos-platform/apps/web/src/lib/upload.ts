import { clientApi } from "./api-client";

export async function uploadFileDirectly(file: File, folderType: string = "documents"): Promise<{ id: string; url: string } | null> {
  try {
    // 1. Lấy chữ ký từ Backend
    const signatureData = await clientApi.get<any>(`/files/signature?folder=${folderType}`);
    
    // 2. Upload file trực tiếp lên Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", signatureData.timestamp.toString());
    formData.append("signature", signatureData.signature);
    formData.append("api_key", signatureData.apiKey);
    formData.append("folder", signatureData.folder);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!cloudinaryResponse.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const cloudinaryResult = await cloudinaryResponse.json();

    // 3. Confirm với Backend
    const confirmResult = await clientApi.post<{ id: string }>("/files/confirm", {
      storageKey: cloudinaryResult.public_id,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: cloudinaryResult.bytes,
      provider: "CLOUDINARY",
    });

    return { id: confirmResult.id, url: cloudinaryResult.secure_url };
  } catch (error) {
    console.error("Direct upload failed:", error);
    return null;
  }
}
