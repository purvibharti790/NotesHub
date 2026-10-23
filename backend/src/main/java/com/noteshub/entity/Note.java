package com.noteshub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 255)
    private String title;

    @NotBlank(message = "Subject is required")
    @Column(nullable = false, length = 150)
    private String subject;

    @NotBlank(message = "Branch is required")
    @Column(nullable = false, length = 50)
    private String branch; // CSE, IT, ECE, EEE, MECH, CIVIL

    @NotNull(message = "Semester is required")
    @Column(nullable = false)
    private Integer semester; // 1 to 8

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 150)
    private String uploaderName;

    @Column(length = 255)
    private String fileName;

    @Column(length = 100)
    private String fileType; // application/pdf

    private Long fileSize; // in bytes

    @Column(length = 500)
    private String filePath;

    @Column(nullable = false)
    private Integer downloadCount = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Note() {
    }

    public Note(String title, String subject, String branch, Integer semester, String description, String uploaderName, String fileName, Long fileSize) {
        this.title = title;
        this.subject = subject;
        this.branch = branch;
        this.semester = semester;
        this.description = description;
        this.uploaderName = uploaderName;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.fileType = "application/pdf";
        this.downloadCount = 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.downloadCount == null) {
            this.downloadCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUploaderName() {
        return uploaderName;
    }

    public void setUploaderName(String uploaderName) {
        this.uploaderName = uploaderName;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Integer getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Integer downloadCount) {
        this.downloadCount = downloadCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("downloads")
    public Integer getDownloads() {
        return downloadCount != null ? downloadCount : 0;
    }

    public void setDownloads(Integer downloads) {
        this.downloadCount = downloads;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("uploader")
    public String getUploader() {
        return uploaderName;
    }

    public void setUploader(String uploader) {
        this.uploaderName = uploader;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("fileSizeFormatted")
    public String getFileSizeFormatted() {
        if (fileSize == null || fileSize <= 0) return "PDF";
        final String[] units = new String[] { "B", "KB", "MB", "GB" };
        int digitGroups = (int) (Math.log10(fileSize) / Math.log10(1024));
        return new java.text.DecimalFormat("#,##0.#").format(fileSize / Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }
}
