package com.animalwelfare.infrastructure;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * ImageStorageService — abstraction over Cloudinary (prod) and local filesystem (dev).
 *
 * Strategy:
 * - If Cloudinary API key is configured → upload to Cloudinary CDN
 * - If API key is blank/demo → save locally to src/main/resources/static/assets/stray_animals/
 *
 * This lets the app run fully without any cloud account in development,
 * while being production-ready for Cloudinary with zero code changes.
 *
 * Upload result always returns { url, publicId } regardless of backend.
 */
@Service
public class ImageStorageService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.api-key:}")
    private String cloudinaryApiKey;

    public ImageStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public record UploadResult(String url, String publicId) {}

    /**
     * Upload an image. Uses Cloudinary if configured, local storage otherwise.
     *
     * @param file      multipart file from the request
     * @param folder    Cloudinary folder name (e.g. "animals", "news")
     * @return UploadResult with public URL and publicId for future deletion
     */
    public UploadResult upload(MultipartFile file, String folder) throws IOException {
        // Validate that it is a safe image extension and content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new com.animalwelfare.exception.BusinessException("Only image uploads are allowed!");
        }
        
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            String ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) {
                throw new com.animalwelfare.exception.BusinessException("Invalid image file format! Allowed formats: JPG, JPEG, PNG, WEBP, GIF.");
            }
        }

        if (isCloudinaryConfigured()) {
            return uploadToCloudinary(file, folder);
        } else {
            return saveLocally(file);
        }
    }

    /**
     * Delete an image by publicId (Cloudinary only — local files are retained).
     */
    public void delete(String publicId) {
        if (isCloudinaryConfigured() && publicId != null && !publicId.startsWith("local/")) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (IOException e) {
                // Log and continue — deletion failure shouldn't block other operations
                System.err.println("Failed to delete Cloudinary image: " + publicId);
            }
        }
    }

    private boolean isCloudinaryConfigured() {
        String urlEnv = System.getenv("CLOUDINARY_URL");
        boolean hasUrlEnv = urlEnv != null && !urlEnv.isBlank();
        boolean hasKeyConfig = cloudinaryApiKey != null && !cloudinaryApiKey.isBlank()
                && !cloudinaryApiKey.equals("demo");
        return hasUrlEnv || hasKeyConfig;
    }

    private UploadResult uploadToCloudinary(MultipartFile file, String folder) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "animal-welfare/" + folder,
                        "resource_type", "image",
                        "transformation", "q_auto,f_auto"
                )
        );
        String url      = (String) result.get("secure_url");
        String publicId = (String) result.get("public_id");
        return new UploadResult(url, publicId);
    }

    private UploadResult saveLocally(MultipartFile file) throws IOException {
        // Save to static assets directory so Spring serves it directly
        Path uploadPath = Paths.get("src/main/resources/static/assets/uploads");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName = file.getOriginalFilename();
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : ".jpg";

        String fileName = UUID.randomUUID() + ext;
        Path filePath   = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return new UploadResult("/assets/uploads/" + fileName, "local/" + fileName);
    }
}
