package com.noteshub.repository;

import com.noteshub.entity.Note;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    @Query("SELECT n FROM Note n WHERE " +
           "(:branch IS NULL OR :branch = '' OR :branch = 'ALL' OR UPPER(n.branch) = UPPER(:branch)) AND " +
           "(:semester IS NULL OR n.semester = :semester) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(n.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(n.uploaderName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Note> findFiltered(
            @Param("branch") String branch,
            @Param("semester") Integer semester,
            @Param("search") String search,
            Sort sort
    );

    List<Note> findByBranchIgnoreCase(String branch);

    List<Note> findBySemester(Integer semester);

    @Query("SELECT COALESCE(SUM(n.downloadCount), 0) FROM Note n")
    Long sumTotalDownloads();

    @Query("SELECT DISTINCT n.branch FROM Note n ORDER BY n.branch")
    List<String> findDistinctBranches();
}
