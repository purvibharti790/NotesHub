package com.noteshub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${noteshub.upload.dir:../uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the upload directory: " + this.fileStorageLocation, ex);
        }
    }

    public Path getStorageLocation() {
        return this.fileStorageLocation;
    }

    /**
     * Stores a multipart uploaded file safely and returns the stored filename.
     */
    public String storeFile(MultipartFile file) throws IOException {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + originalFilename);
        }

        // Clean extension and create unique filename
        String fileExtension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex >= 0) {
            fileExtension = originalFilename.substring(extIndex);
        }

        String safeBaseName = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
        String uniqueFilename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "_" + safeBaseName;

        Path targetLocation = this.fileStorageLocation.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFilename;
    }

    /**
     * Creates a sample valid PDF file in the storage directory for seeding notes.
     */
    public String createSamplePdfFile(String filename, String title, String subject, String branch, int semester, String author) throws IOException {
        Path targetLocation = this.fileStorageLocation.resolve(filename);
        if (!Files.exists(targetLocation)) {
            String safeTitle = title.replace("(", "").replace(")", "");
            String safeSubject = subject.replace("(", "").replace(")", "");
            String safeAuthor = author.replace("(", "").replace(")", "");

            String pdfContent = "%PDF-1.4\n" +
                    "1 0 obj << /Title (" + safeTitle + ") /Author (" + safeAuthor + ") /Subject (" + safeSubject + ") >> endobj\n" +
                    "2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj\n" +
                    "3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj\n" +
                    "4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj\n" +
                    "6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n" +
                    "5 0 obj << /Length 380 >>\n" +
                    "stream\n" +
                    "BT\n" +
                    "/F1 20 Tf\n" +
                    "50 720 Td\n" +
                    "(NotesHub - Verified Academic Study Notes) Tj\n" +
                    "0 -35 Td\n" +
                    "/F1 16 Tf\n" +
                    "(" + safeTitle + ") Tj\n" +
                    "0 -25 Td\n" +
                    "/F1 12 Tf\n" +
                    "(Subject: " + safeSubject + " | Branch: " + branch + " Sem: " + semester + ") Tj\n" +
                    "0 -20 Td\n" +
                    "(Uploaded by: " + safeAuthor + ") Tj\n" +
                    "0 -40 Td\n" +
                    "(B.Tech CSE Project - Verified Study Material Repository) Tj\n" +
                    "ET\n" +
                    "endstream\n" +
                    "endobj\n" +
                    "xref\n" +
                    "0 7\n" +
                    "0000000000 65535 f \n" +
                    "0000000009 00000 n \n" +
                    "0000000140 00000 n \n" +
                    "0000000189 00000 n \n" +
                    "0000000248 00000 n \n" +
                    "0000000450 00000 n \n" +
                    "0000000375 00000 n \n" +
                    "trailer << /Size 7 /Root 2 0 R >>\n" +
                    "startxref\n" +
                    "900\n" +
                    "%%EOF";

            Files.copy(new ByteArrayInputStream(pdfContent.getBytes(StandardCharsets.UTF_8)), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }
        return filename;
    }

    /**
     * Loads a file as a Spring Resource for downloading.
     */
    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filename, ex);
        }
    }

    /**
     * Deletes a stored file if it exists.
     */
    public boolean deleteFile(String filename) {
        if (filename == null || filename.isBlank()) return false;
        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }
}
