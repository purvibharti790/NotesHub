package com.noteshub.service;

import com.noteshub.entity.Note;
import com.noteshub.repository.NoteRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final FileStorageService fileStorageService;

    public NoteService(NoteRepository noteRepository, FileStorageService fileStorageService) {
        this.noteRepository = noteRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Note> getFilteredNotes(String branch, Integer semester, String search, String sortBy) {
        Sort sort;
        if ("downloads".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "downloadCount");
        } else if ("title".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "title");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String safeBranch = (branch != null && !branch.equalsIgnoreCase("ALL") && !branch.isBlank()) ? branch.trim() : null;
        Integer safeSemester = (semester != null && semester > 0) ? semester : null;
        String safeSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        return noteRepository.findFiltered(safeBranch, safeSemester, safeSearch, sort);
    }

    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    @Transactional
    public Note createNote(String title, String subject, String branch, Integer semester,
                           String description, String uploaderName, MultipartFile file) throws IOException {
        String storedFilename = null;
        Long fileSize = 0L;

        if (file != null && !file.isEmpty()) {
            storedFilename = fileStorageService.storeFile(file);
            fileSize = file.getSize();
        }

        Note note = new Note(
                title,
                subject,
                branch,
                semester,
                description,
                (uploaderName != null && !uploaderName.isBlank()) ? uploaderName : "Student",
                storedFilename != null ? storedFilename : (title.replaceAll("\\s+", "_") + ".pdf"),
                fileSize
        );

        if (storedFilename != null) {
            note.setFilePath(storedFilename);
        }

        return noteRepository.save(note);
    }

    @Transactional
    public Note incrementDownloads(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Note not found with id: " + id));
        note.setDownloadCount(note.getDownloadCount() + 1);
        return noteRepository.save(note);
    }

    @Transactional
    public boolean deleteNote(Long id) {
        Optional<Note> opt = noteRepository.findById(id);
        if (opt.isPresent()) {
            Note note = opt.get();
            if (note.getFilePath() != null) {
                fileStorageService.deleteFile(note.getFilePath());
            }
            noteRepository.delete(note);
            return true;
        }
        return false;
    }

    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long totalNotes = noteRepository.count();
        long totalDownloads = noteRepository.sumTotalDownloads();
        List<String> branches = noteRepository.findDistinctBranches();

        stats.put("totalNotes", totalNotes);
        stats.put("totalDownloads", totalDownloads);
        stats.put("branches", branches);
        return stats;
    }
}
