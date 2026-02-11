// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

// Cloudinary signed upload service for .cd project files.
// Uses API key + secret for authenticated uploads.
// Required .env variables:
//   VITE_CLOUDINARY_CLOUD_NAME
//   VITE_CLOUDINARY_API_KEY
//   VITE_CLOUDINARY_API_SECRET
//   VITE_CLOUDINARY_UPLOAD_PRESET (optional)

// Declare process.env for TypeScript
declare const process: {
    env: {
        VITE_CLOUDINARY_CLOUD_NAME?: string;
        VITE_CLOUDINARY_API_KEY?: string;
        VITE_CLOUDINARY_API_SECRET?: string;
        VITE_CLOUDINARY_UPLOAD_PRESET?: string;
    };
};

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    bytes: number;
    format: string;
    created_at: string;
    original_filename: string;
}

export interface CloudinaryService {
    uploadProjectFile: (
        fileContent: string,
        fileName: string,
        sessionId: string,
    ) => Promise<CloudinaryUploadResult>;
    deleteProjectFile: (publicId: string) => Promise<void>;
}

/**
 * Generate SHA-1 hash for Cloudinary signature.
 * Uses the Web Crypto API (available in all modern browsers).
 */
async function sha1(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a Cloudinary upload signature.
 * Params must be sorted alphabetically and concatenated as key=value pairs
 * joined by '&', then appended with the API secret, then SHA-1 hashed.
 */
async function generateSignature(
    params: Record<string, string | number>,
    apiSecret: string,
): Promise<string> {
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
    return sha1(signatureString + apiSecret);
}

export const cloudinaryService: CloudinaryService = {
    /**
     * Upload a .cd project file to Cloudinary using signed upload.
     * Overwrites the previous version using the same public_id (session ID).
     */
    async uploadProjectFile(
        fileContent: string,
        fileName: string,
        sessionId: string,
    ): Promise<CloudinaryUploadResult> {
        // Debug: Log what we're getting from process.env
        console.log("DEBUG - Checking Cloudinary env vars:");
        console.log(
            "  CLOUD_NAME:",
            typeof process.env.VITE_CLOUDINARY_CLOUD_NAME,
            process.env.VITE_CLOUDINARY_CLOUD_NAME,
        );
        console.log(
            "  API_KEY:",
            typeof process.env.VITE_CLOUDINARY_API_KEY,
            process.env.VITE_CLOUDINARY_API_KEY,
        );
        console.log(
            "  API_SECRET:",
            typeof process.env.VITE_CLOUDINARY_API_SECRET,
            process.env.VITE_CLOUDINARY_API_SECRET ? "***" : undefined,
        );

        const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
        const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error(
                "Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY, and VITE_CLOUDINARY_API_SECRET in .env",
            );
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const publicId = `venus_projects/${sessionId}`;

        // Parameters that are included in signature (sorted alphabetically)
        const signatureParams: Record<string, string | number> = {
            overwrite: 1,
            public_id: publicId,
            timestamp,
        };

        const signature = await generateSignature(signatureParams, apiSecret);

        const blob = new Blob([fileContent], { type: "application/json" });
        const file = new File([blob], `${fileName}.cd`, { type: "application/json" });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("public_id", publicId);
        formData.append("overwrite", "true");
        formData.append("resource_type", "raw");

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Cloudinary upload error:", errorData);
            throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            format: result.format,
            created_at: result.created_at,
            original_filename: result.original_filename,
        };
    },

    /**
     * Delete a project file from Cloudinary using signed request.
     */
    async deleteProjectFile(publicId: string): Promise<void> {
        const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
        const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) return;

        const timestamp = Math.floor(Date.now() / 1000);
        const signatureParams = { public_id: publicId, timestamp };
        const signature = await generateSignature(signatureParams, apiSecret);

        const formData = new FormData();
        formData.append("public_id", publicId);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);

        try {
            await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`, {
                method: "POST",
                body: formData,
            });
        } catch (error) {
            console.warn("Failed to delete file from Cloudinary:", error);
        }
    },
};
