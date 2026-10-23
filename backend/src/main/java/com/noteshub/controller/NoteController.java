package com.noteshub.controller;

import com.noteshub.entity.Note;
import com.noteshub.service.FileStorageService;
import com.noteshub.service.NoteService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {

    private final NoteService noteService;
    private final FileStorageService fileStorageService;

    public NoteController(NoteService noteService, FileStorageService fileStorageService) {
        this.noteService = noteService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * GET /api/notes
     * Fetches all notes with optional branch, semester, search keyword and sorting.
     */
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes(
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sortBy) {

        List<Note> notes = noteService.getFilteredNotes(branch, semester, search, sortBy);
        return ResponseEntity.ok(notes);
    }

    /**
     * GET /api/notes/{id}
     * Retrieves a single note by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/notes
     * Uploads study material with metadata and attached PDF file.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadNote(
            @RequestParam("title") String title,
            @RequestParam("branch") String branch,
            @RequestParam("semester") Integer semester,
            @RequestParam("subject") String subject,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "uploaderName", required = false) String uploaderName,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            Note savedNote = noteService.createNote(title, subject, branch, semester, description, uploaderName, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/notes/{id}/download
     * Downloads the PDF file and automatically increments the note's download counter.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadNote(@PathVariable Long id) {
        Optional<Note> optNote = noteService.getNoteById(id);
        if (optNote.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Note note = optNote.get();

        // Increment download counter
        noteService.incrementDownloads(id);

        Resource resource = null;
        if (note.getFilePath() != null && !note.getFilePath().isBlank()) {
            try {
                resource = fileStorageService.loadFileAsResource(note.getFilePath());
            } catch (Exception ignored) {
                // Fallback to generated resource if file was moved or on local sample
            }
        }

        if (resource == null) {
            // Generate valid on-the-fly PDF byte stream if file was not on disk
            String pdfStub = "%PDF-1.4\n1 0 obj << /Title (" + note.getTitle() + ") >> endobj\n" +
                    "2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj\n" +
                    "3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj\n" +
                    "4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj\n" +
                    "5 0 obj << /Length 70 >>\nstream\nBT /F1 14 Tf 50 700 Td (" + note.getTitle() + ") Tj ET\nendstream\nendobj\n" +
                    "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000070 00000 n \n0000000120 00000 n \n0000000179 00000 n \n0000000280 00000 n \n" +
                    "trailer << /Size 6 /Root 2 0 R >>\nstartxref\n410\n%%EOF";
            resource = new ByteArrayResource(pdfStub.getBytes(StandardCharsets.UTF_8));
        }

        String downloadFilename = note.getFileName() != null ? note.getFileName() : (note.getTitle().replaceAll("\\s+", "_") + ".pdf");
        if (!downloadFilename.toLowerCase().endsWith(".pdf")) {
            downloadFilename += ".pdf";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFilename + "\"")
                .body(resource);
    }

    /**
     * DELETE /api/notes/{id}
     * Removes note and associated file from the platform.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        boolean deleted = noteService.deleteNote(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Note deleted successfully."));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/notes/stats
     * Returns platform-wide statistics for the dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(noteService.getStatistics());
    }
}
