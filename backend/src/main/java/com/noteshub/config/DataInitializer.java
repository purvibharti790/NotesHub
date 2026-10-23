package com.noteshub.config;

import com.noteshub.entity.Note;
import com.noteshub.entity.User;
import com.noteshub.repository.NoteRepository;
import com.noteshub.repository.UserRepository;
import com.noteshub.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(NoteRepository noteRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService,
                           PasswordEncoder passwordEncoder) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedNotes();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding default student and admin users...");

            User student = new User(
                    "Rahul Sharma",
                    "student@noteshub.edu",
                    passwordEncoder.encode("password123"),
                    "ROLE_STUDENT"
            );

            User admin = new User(
                    "NotesHub Admin",
                    "admin@noteshub.edu",
                    passwordEncoder.encode("admin123"),
                    "ROLE_ADMIN"
            );

            userRepository.saveAll(List.of(student, admin));
            log.info("Default users created: student@noteshub.edu / password123, admin@noteshub.edu / admin123");
        }
    }

    private void seedNotes() {
        if (noteRepository.count() == 0) {
            log.info("Seeding verified B.Tech semester study notes...");

            try {
                // Note 1 - OS
                String f1 = fileStorageService.createSamplePdfFile(
                        "Operating_Systems_Module_2_Deadlocks.pdf",
                        "Process Scheduling, Synchronization & Deadlocks",
                        "Operating Systems (OS)",
                        "CSE", 4, "Rahul Sharma (Roll: 22CSE045)"
                );
                Note n1 = new Note(
                        "Process Scheduling, Synchronization & Deadlocks",
                        "Operating Systems (OS)",
                        "CSE",
                        4,
                        "Comprehensive handwritten lecture notes covering CPU scheduling algorithms (FCFS, SJF, Round Robin), Peterson’s algorithm, Semaphores, Monitors, and Banker’s Deadlock Avoidance.",
                        "Rahul Sharma (Roll: 22CSE045)",
                        "Operating_Systems_Module_2_Deadlocks.pdf",
                        3565158L
                );
                n1.setFilePath(f1);
                n1.setDownloadCount(412);

                // Note 2 - DBMS
                String f2 = fileStorageService.createSamplePdfFile(
                        "DBMS_Normalization_Notes.pdf",
                        "Relational Schema Design & Normalization (1NF to BCNF)",
                        "Database Management Systems (DBMS)",
                        "CSE", 4, "Ananya Verma (Roll: 22CSE012)"
                );
                Note n2 = new Note(
                        "Relational Schema Design & Normalization (1NF to BCNF)",
                        "Database Management Systems (DBMS)",
                        "CSE",
                        4,
                        "Full exam revision package: Functional Dependencies, 1NF, 2NF, 3NF, BCNF decomposition examples, and ACID transaction recovery mechanisms.",
                        "Ananya Verma (Roll: 22CSE012)",
                        "DBMS_Normalization_Notes.pdf",
                        4300000L
                );
                n2.setFilePath(f2);
                n2.setDownloadCount(589);

                // Note 3 - DAA
                String f3 = fileStorageService.createSamplePdfFile(
                        "DAA_Graph_Algorithms_Handwritten.pdf",
                        "Graph Algorithms: BFS, DFS, Dijkstra & Kruskal",
                        "Design & Analysis of Algorithms (DAA)",
                        "IT", 5, "Karthik Rao (Roll: 21IT088)"
                );
                Note n3 = new Note(
                        "Graph Algorithms: BFS, DFS, Dijkstra & Kruskal",
                        "Design & Analysis of Algorithms (DAA)",
                        "IT",
                        5,
                        "Step-by-step trace diagrams, pseudocode, asymptotic time & space complexity proofs for Minimum Spanning Trees, Shortest Path and Dynamic Programming.",
                        "Karthik Rao (Roll: 21IT088)",
                        "DAA_Graph_Algorithms_Handwritten.pdf",
                        5450000L
                );
                n3.setFilePath(f3);
                n3.setDownloadCount(320);

                // Note 4 - ECE
                String f4 = fileStorageService.createSamplePdfFile(
                        "ECE_8086_Architecture_Complete.pdf",
                        "Microprocessors 8086 Architecture & Assembly Commands",
                        "Microprocessors & Microcontrollers",
                        "ECE", 5, "Sneha Patel (Roll: 21ECE034)"
                );
                Note n4 = new Note(
                        "Microprocessors 8086 Architecture & Assembly Commands",
                        "Microprocessors & Microcontrollers",
                        "ECE",
                        5,
                        "Pin diagrams, register architecture, addressing modes, and complete sample assembly language programs for array sorting and string manipulation.",
                        "Sneha Patel (Roll: 21ECE034)",
                        "ECE_8086_Architecture_Complete.pdf",
                        2900000L
                );
                n4.setFilePath(f4);
                n4.setDownloadCount(185);

                // Note 5 - MECH
                String f5 = fileStorageService.createSamplePdfFile(
                        "Mech_Thermodynamics_Derivations.pdf",
                        "Thermodynamics Laws, Heat Engines & Carnot Cycle",
                        "Applied Thermodynamics",
                        "MECH", 3, "Vikas Deshmukh (Roll: 23MECH019)"
                );
                Note n5 = new Note(
                        "Thermodynamics Laws, Heat Engines & Carnot Cycle",
                        "Applied Thermodynamics",
                        "MECH",
                        3,
                        "Detailed derivations of First & Second laws, P-V and T-S state diagrams, enthalpy calculations, and numerical problem solutions for university end-semester.",
                        "Vikas Deshmukh (Roll: 23MECH019)",
                        "Mech_Thermodynamics_Derivations.pdf",
                        5033164L
                );
                n5.setFilePath(f5);
                n5.setDownloadCount(247);

                // Note 6 - CIVIL
                String f6 = fileStorageService.createSamplePdfFile(
                        "Civil_RCC_Design_IS456.pdf",
                        "Design of Reinforced Concrete Structures (LSM & WSM)",
                        "Structural Analysis & RCC",
                        "CIVIL", 6, "Pooja Nair (Roll: 20CIVIL051)"
                );
                Note n6 = new Note(
                        "Design of Reinforced Concrete Structures (LSM & WSM)",
                        "Structural Analysis & RCC",
                        "CIVIL",
                        6,
                        "IS 456:2000 compliant design formulas, singly & doubly reinforced beams, shear reinforcement checks, and solved design questions.",
                        "Pooja Nair (Roll: 20CIVIL051)",
                        "Civil_RCC_Design_IS456.pdf",
                        6396313L
                );
                n6.setFilePath(f6);
                n6.setDownloadCount(164);

                noteRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6));
                log.info("Successfully seeded 6 realistic B.Tech study notes with corresponding PDF files.");
            } catch (Exception e) {
                log.error("Failed to seed sample note PDF files", e);
            }
        }
    }
}
