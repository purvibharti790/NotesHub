/**
 * NotesHub — Student Notes Sharing Platform
 * Frontend Application Logic (app.js)
 * Features: Live Backend API Detection, Seamless Offline/Fallback Mode,
 * Dynamic Filtering, Search, PDF Upload/Download, Preview Modal, Auth Flow.
 */

(function () {
  'use strict';

  // API Base Configuration
  const API_CONFIG = {
    BASE_URL: 'http://localhost:8081/api',
    HEALTH_ENDPOINT: '/health',
    NOTES_ENDPOINT: '/notes',
    AUTH_ENDPOINT: '/auth',
    CHECK_INTERVAL: 10000 // Polling backend status every 10s
  };

  // Seed Data: Realistic 3rd-Year B.Tech Notes for instant exploration
  const DEFAULT_NOTES = [
    {
      id: 'note-1',
      title: 'Process Scheduling, Synchronization & Deadlocks',
      subject: 'Operating Systems (OS)',
      branch: 'CSE',
      semester: '4',
      description: 'Comprehensive handwritten lecture notes covering CPU scheduling algorithms (FCFS, SJF, Round Robin), Peterson’s algorithm, Semaphores, Monitors, and Banker’s Deadlock Avoidance.',
      uploader: 'Rahul Sharma (Roll: 22CSE045)',
      downloads: 412,
      createdAt: '2026-09-15',
      fileName: 'Operating_Systems_Module_2_Deadlocks.pdf',
      fileSize: '3.4 MB'
    },
    {
      id: 'note-2',
      title: 'Relational Schema Design & Normalization (1NF to BCNF)',
      subject: 'Database Management Systems (DBMS)',
      branch: 'CSE',
      semester: '4',
      description: 'Full exam revision package: Functional Dependencies, 1NF, 2NF, 3NF, BCNF decomposition examples, and ACID transaction recovery mechanisms.',
      uploader: 'Ananya Verma (Roll: 22CSE012)',
      downloads: 589,
      createdAt: '2026-09-28',
      fileName: 'DBMS_Normalization_Notes.pdf',
      fileSize: '4.1 MB'
    },
    {
      id: 'note-3',
      title: 'Graph Algorithms: BFS, DFS, Dijkstra & Kruskal',
      subject: 'Design & Analysis of Algorithms (DAA)',
      branch: 'IT',
      semester: '5',
      description: 'Step-by-step trace diagrams, pseudocode, asymptotic time & space complexity proofs for Minimum Spanning Trees, Shortest Path and Dynamic Programming.',
      uploader: 'Karthik Rao (Roll: 21IT088)',
      downloads: 320,
      createdAt: '2026-10-02',
      fileName: 'DAA_Graph_Algorithms_Handwritten.pdf',
      fileSize: '5.2 MB'
    },
    {
      id: 'note-4',
      title: 'Microprocessors 8086 Architecture & Assembly Commands',
      subject: 'Microprocessors & Microcontrollers',
      branch: 'ECE',
      semester: '5',
      description: 'Pin diagrams, register architecture, addressing modes, and complete sample assembly language programs for array sorting and string manipulation.',
      uploader: 'Sneha Patel (Roll: 21ECE034)',
      downloads: 185,
      createdAt: '2026-08-20',
      fileName: 'ECE_8086_Architecture_Complete.pdf',
      fileSize: '2.8 MB'
    },
    {
      id: 'note-5',
      title: 'Thermodynamics Laws, Heat Engines & Carnot Cycle',
      subject: 'Applied Thermodynamics',
      branch: 'MECH',
      semester: '3',
      description: 'Detailed derivations of First & Second laws, P-V and T-S state diagrams, enthalpy calculations, and numerical problem solutions for university end-semester.',
      uploader: 'Vikas Deshmukh (Roll: 23MECH019)',
      downloads: 247,
      createdAt: '2026-10-05',
      fileName: 'Mech_Thermodynamics_Derivations.pdf',
      fileSize: '4.8 MB'
    },
    {
      id: 'note-6',
      title: 'Design of Reinforced Concrete Structures (LSM & WSM)',
      subject: 'Structural Analysis & RCC',
      branch: 'CIVIL',
      semester: '6',
      description: 'IS 456:2000 compliant design formulas, singly & doubly reinforced beams, shear reinforcement checks, and solved design questions.',
      uploader: 'Pooja Nair (Roll: 20CIVIL051)',
      downloads: 164,
      createdAt: '2026-09-10',
      fileName: 'Civil_RCC_Design_IS456.pdf',
      fileSize: '6.1 MB'
    }
  ];

  // Application State
  const state = {
    isBackendOnline: false,
    notes: [],
    filters: {
      search: '',
      branch: 'ALL',
      semester: 'ALL',
      sortBy: 'newest'
    },
    currentUser: null,
    selectedFile: null,
    activePreviewNote: null
  };

  // DOM Elements Cache
  const DOM = {};

  function initDOM() {
    DOM.navbar = document.getElementById('mainNavbar');
    DOM.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    DOM.navMenu = document.getElementById('navMenu');
    DOM.backendStatusPill = document.getElementById('backendStatusPill');
    DOM.backendStatusText = document.getElementById('backendStatusText');
    DOM.searchInput = document.getElementById('searchInput');
    DOM.clearSearchBtn = document.getElementById('clearSearchBtn');
    DOM.filterBranch = document.getElementById('filterBranch');
    DOM.filterSemester = document.getElementById('filterSemester');
    DOM.filterSort = document.getElementById('filterSort');
    DOM.btnResetFilters = document.getElementById('btnResetFilters');
    DOM.activeFiltersBar = document.getElementById('activeFiltersBar');
    DOM.filterChipsContainer = document.getElementById('filterChipsContainer');
    DOM.resultsCountText = document.getElementById('resultsCountText');
    DOM.notesGrid = document.getElementById('notesGrid');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.btnEmptyReset = document.getElementById('btnEmptyReset');
    DOM.statTotalNotes = document.getElementById('statTotalNotes');
    DOM.statDownloads = document.getElementById('statDownloads');

    // Modals
    DOM.uploadModal = document.getElementById('uploadModal');
    DOM.btnOpenUploadModal = document.getElementById('btnOpenUploadModal');
    DOM.heroUploadBtn = document.getElementById('heroUploadBtn');
    DOM.btnCloseUploadModal = document.getElementById('btnCloseUploadModal');
    DOM.btnCancelUpload = document.getElementById('btnCancelUpload');
    DOM.uploadNotesForm = document.getElementById('uploadNotesForm');
    DOM.fileDropzone = document.getElementById('fileDropzone');
    DOM.pdfFileInput = document.getElementById('pdfFileInput');
    DOM.dropzonePrompt = document.getElementById('dropzonePrompt');
    DOM.fileSelectedBox = document.getElementById('fileSelectedBox');
    DOM.selectedFilename = document.getElementById('selectedFilename');
    DOM.selectedFilesize = document.getElementById('selectedFilesize');
    DOM.btnRemoveFile = document.getElementById('btnRemoveFile');

    // Preview Modal
    DOM.previewModal = document.getElementById('previewModal');
    DOM.btnClosePreviewModal = document.getElementById('btnClosePreviewModal');
    DOM.btnClosePreviewBtn = document.getElementById('btnClosePreviewBtn');
    DOM.modalPreviewBranch = document.getElementById('modalPreviewBranch');
    DOM.modalPreviewTitle = document.getElementById('modalPreviewTitle');
    DOM.modalPreviewSubject = document.getElementById('modalPreviewSubject');
    DOM.modalPreviewUploader = document.getElementById('modalPreviewUploader');
    DOM.modalPreviewDate = document.getElementById('modalPreviewDate');
    DOM.modalPreviewDownloads = document.getElementById('modalPreviewDownloads');
    DOM.modalPreviewDesc = document.getElementById('modalPreviewDesc');
    DOM.btnModalDownload = document.getElementById('btnModalDownload');

    // Auth Modal
    DOM.authModal = document.getElementById('authModal');
    DOM.btnOpenAuthModal = document.getElementById('btnOpenAuthModal');
    DOM.btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
    DOM.authButtonText = document.getElementById('authButtonText');
    DOM.tabLoginBtn = document.getElementById('tabLoginBtn');
    DOM.tabRegisterBtn = document.getElementById('tabRegisterBtn');
    DOM.loginForm = document.getElementById('loginForm');
    DOM.registerForm = document.getElementById('registerForm');

    // Toast Container
    DOM.toastContainer = document.getElementById('toastContainer');
  }

  // -------------------------------------------------------------------------
  // LocalStorage Persistence
  // -------------------------------------------------------------------------
  function loadLocalNotes() {
    try {
      const stored = localStorage.getItem('noteshub_notes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return DEFAULT_NOTES;
  }

  function saveLocalNotes(notes) {
    try {
      localStorage.setItem('noteshub_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  function loadUserSession() {
    try {
      const user = localStorage.getItem('noteshub_user');
      if (user) {
        state.currentUser = JSON.parse(user);
        updateAuthUI();
      }
    } catch (e) {
      console.warn('Could not load user session', e);
    }
  }

  function saveUserSession(user) {
    try {
      state.currentUser = user;
      if (user) {
        localStorage.setItem('noteshub_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('noteshub_user');
      }
      updateAuthUI();
    } catch (e) {
      console.warn('Could not persist user session', e);
    }
  }

  // -------------------------------------------------------------------------
  // Backend Health & API Communication
  // -------------------------------------------------------------------------
  async function checkBackendStatus() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.HEALTH_ENDPOINT}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (response.ok) {
        setBackendOnline(true);
        await syncNotesFromBackend();
        return;
      }
    } catch (e) {
      // Backend is offline or unreachable
    }

    setBackendOnline(false);
  }

  function setBackendOnline(isOnline) {
    state.isBackendOnline = isOnline;
    if (DOM.backendStatusPill) {
      if (isOnline) {
        DOM.backendStatusPill.className = 'backend-status-pill online';
        DOM.backendStatusText.textContent = 'Spring Boot API: Online';
        DOM.backendStatusPill.title = 'Connected to Java Spring Boot REST backend on port 8080';
      } else {
        DOM.backendStatusPill.className = 'backend-status-pill';
        DOM.backendStatusText.textContent = 'Local Mode (Storage)';
        DOM.backendStatusPill.title = 'Spring Boot API is offline. Running with client-side persistence.';
      }
    }
  }

  async function syncNotesFromBackend() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.NOTES_ENDPOINT}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          state.notes = data;
          saveLocalNotes(data);
          renderNotes();
          updateStats();
        }
      }
    } catch (e) {
      console.warn('Backend sync failed, maintaining local state', e);
    }
  }

  // -------------------------------------------------------------------------
  // Rendering Notes & Stats
  // -------------------------------------------------------------------------
  function renderNotes() {
    if (!DOM.notesGrid) return;

    const filtered = getFilteredNotes();

    // Update Result Counter
    if (DOM.resultsCountText) {
      DOM.resultsCountText.innerHTML = `Showing <strong>${filtered.length}</strong> ${filtered.length === 1 ? 'note' : 'notes'}`;
    }

    // Toggle Empty State
    if (filtered.length === 0) {
      DOM.notesGrid.innerHTML = '';
      if (DOM.emptyState) DOM.emptyState.style.display = 'block';
      return;
    }

    if (DOM.emptyState) DOM.emptyState.style.display = 'none';

    // Build Cards HTML
    DOM.notesGrid.innerHTML = filtered.map(note => `
      <article class="note-card" data-id="${note.id}">
        <div>
          <div class="note-card-header">
            <div class="note-badge-group">
              <span class="badge badge-branch">${escapeHTML(note.branch)}</span>
              <span class="badge badge-sem">Sem ${escapeHTML(String(note.semester))}</span>
            </div>
            <span class="note-downloads-tag" title="Total Downloads">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              ${note.downloads != null ? note.downloads : (note.downloadCount || 0)}
            </span>
          </div>

          <h3 class="note-title">${escapeHTML(note.title)}</h3>
          <p class="note-subject">${escapeHTML(note.subject)}</p>
          <p class="note-desc">${escapeHTML(note.description || 'No detailed syllabus topics provided.')}</p>
        </div>

        <div>
          <div class="note-meta-row">
            <span class="note-uploader">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              ${escapeHTML(note.uploader || note.uploaderName || 'Anonymous Student')}
            </span>
            <span class="note-filesize">${escapeHTML(typeof note.fileSize === 'number' ? formatBytes(note.fileSize) : (note.fileSizeFormatted || note.fileSize || 'PDF'))}</span>
          </div>

          <div class="note-card-footer">
            <button class="btn btn-secondary btn-sm btn-preview" data-id="${note.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Preview
            </button>
            <button class="btn btn-primary btn-sm btn-download" data-id="${note.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </button>
          </div>
        </div>
      </article>
    `).join('');

    renderActiveFilterChips();
  }

  function getFilteredNotes() {
    let result = [...state.notes];

    // Branch filter
    if (state.filters.branch !== 'ALL') {
      result = result.filter(n => n.branch && n.branch.toUpperCase() === state.filters.branch.toUpperCase());
    }

    // Semester filter
    if (state.filters.semester !== 'ALL') {
      result = result.filter(n => String(n.semester) === String(state.filters.semester));
    }

    // Search query filter (title, subject, description, uploader)
    if (state.filters.search.trim()) {
      const q = state.filters.search.trim().toLowerCase();
      result = result.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.subject && n.subject.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q)) ||
        (n.branch && n.branch.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (state.filters.sortBy === 'downloads') {
      result.sort((a, b) => (b.downloads != null ? b.downloads : (b.downloadCount || 0)) - (a.downloads != null ? a.downloads : (a.downloadCount || 0)));
    } else if (state.filters.sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      // newest
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }

  function renderActiveFilterChips() {
    if (!DOM.activeFiltersBar || !DOM.filterChipsContainer) return;

    const chips = [];

    if (state.filters.branch !== 'ALL') {
      chips.push({ key: 'branch', label: `Branch: ${state.filters.branch}` });
    }
    if (state.filters.semester !== 'ALL') {
      chips.push({ key: 'semester', label: `Sem: ${state.filters.semester}` });
    }
    if (state.filters.search.trim()) {
      chips.push({ key: 'search', label: `Search: "${state.filters.search.trim()}"` });
    }

    if (chips.length > 0) {
      DOM.activeFiltersBar.style.display = 'flex';
      DOM.filterChipsContainer.innerHTML = chips.map(chip => `
        <span class="filter-chip">
          ${escapeHTML(chip.label)}
          <span class="chip-remove" data-key="${chip.key}" title="Remove filter">&times;</span>
        </span>
      `).join('');
    } else {
      DOM.activeFiltersBar.style.display = 'none';
      DOM.filterChipsContainer.innerHTML = '';
    }
  }

  function updateStats() {
    const totalNotes = state.notes.length;
    const totalDownloads = state.notes.reduce((acc, curr) => acc + (curr.downloads != null ? curr.downloads : (curr.downloadCount || 0)), 0);

    if (DOM.statTotalNotes) {
      DOM.statTotalNotes.textContent = `${totalNotes}+`;
    }
    if (DOM.statDownloads) {
      DOM.statDownloads.textContent = `${totalDownloads.toLocaleString()}+`;
    }
  }

  // -------------------------------------------------------------------------
  // Preview Modal & PDF Download Flow
  // -------------------------------------------------------------------------
  function openPreviewModal(noteId) {
    const note = state.notes.find(n => String(n.id) === String(noteId));
    if (!note) return;

    state.activePreviewNote = note;

    if (DOM.modalPreviewBranch) DOM.modalPreviewBranch.textContent = `${note.branch} • Sem ${note.semester}`;
    if (DOM.modalPreviewTitle) DOM.modalPreviewTitle.textContent = note.title;
    if (DOM.modalPreviewSubject) DOM.modalPreviewSubject.textContent = note.subject;
    if (DOM.modalPreviewUploader) DOM.modalPreviewUploader.textContent = note.uploader || note.uploaderName || 'Student';
    if (DOM.modalPreviewDate) DOM.modalPreviewDate.textContent = formatDate(note.createdAt);
    if (DOM.modalPreviewDownloads) DOM.modalPreviewDownloads.textContent = `${note.downloads != null ? note.downloads : (note.downloadCount || 0)} downloads`;
    if (DOM.modalPreviewDesc) DOM.modalPreviewDesc.textContent = note.description || 'No syllabus description provided.';

    openModal(DOM.previewModal);
  }

  async function handleDownload(noteId) {
    const note = state.notes.find(n => String(n.id) === String(noteId));
    if (!note) return;

    // Increment downloads locally
    const currentDownloads = (note.downloads != null ? note.downloads : (note.downloadCount || 0)) + 1;
    note.downloads = currentDownloads;
    note.downloadCount = currentDownloads;
    saveLocalNotes(state.notes);
    renderNotes();
    updateStats();

    // If modal open, update count inside modal
    if (DOM.modalPreviewDownloads && state.activePreviewNote && state.activePreviewNote.id === note.id) {
      DOM.modalPreviewDownloads.textContent = `${currentDownloads} downloads`;
    }

    showToast('Download Started', `Downloading "${note.title}"...`, 'info');

    // If backend online, call backend download endpoint
    if (state.isBackendOnline) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.NOTES_ENDPOINT}/${note.id}/download`);
        if (response.ok) {
          const blob = await response.blob();
          triggerBlobDownload(blob, note.fileName || `${note.title.replace(/\s+/g, '_')}.pdf`);
          return;
        }
      } catch (err) {
        console.warn('Backend download failed, falling back to generated PDF stub', err);
      }
    }

    // Client-side fallback PDF generator stub
    generateAndDownloadMockPdf(note);
  }

  function triggerBlobDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
  }

  function generateAndDownloadMockPdf(note) {
    // Generates a well-formatted PDF document stream using raw PDF syntax for instant download
    const pdfContent = `%PDF-1.4
1 0 obj << /Title (${escapePdfString(note.title)}) /Author (${escapePdfString(note.uploader || 'NotesHub')}) /Subject (${escapePdfString(note.subject)}) >> endobj
2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj
3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
5 0 obj << /Length 400 >>
stream
BT
/F1 22 Tf
50 720 Td
(NotesHub - Academic Study Material) Tj
0 -35 Td
/F1 16 Tf
(${escapePdfString(note.title)}) Tj
0 -25 Td
/F1 12 Tf
(Subject: ${escapePdfString(note.subject)} | Branch: ${escapePdfString(note.branch)} Sem: ${escapePdfString(String(note.semester))}) Tj
0 -20 Td
(Uploaded by: ${escapePdfString(note.uploader || 'Student')} | Date: ${escapePdfString(note.createdAt)}) Tj
0 -40 Td
(Topics & Description:) Tj
0 -20 Td
(${escapePdfString(note.description || 'Verified College Study Notes')}) Tj
0 -50 Td
(Verified by NotesHub Student Portal - B.Tech CSE Mini-Project) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000140 00000 n 
0000000189 00000 n 
0000000248 00000 n 
0000000450 00000 n 
0000000375 00000 n 
trailer << /Size 7 /Root 2 0 R >>
startxref
900
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    triggerBlobDownload(blob, note.fileName || `${note.subject.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`);
  }

  function escapePdfString(str) {
    if (!str) return '';
    return str.replace(/[\\()]/g, '');
  }

  // -------------------------------------------------------------------------
  // Upload Notes Flow & Validation
  // -------------------------------------------------------------------------
  function setupUploadForm() {
    if (!DOM.uploadNotesForm) return;

    // Dropzone Drag & Drop
    if (DOM.fileDropzone && DOM.pdfFileInput) {
      DOM.fileDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.fileDropzone.classList.add('dragover');
      });

      DOM.fileDropzone.addEventListener('dragleave', () => {
        DOM.fileDropzone.classList.remove('dragover');
      });

      DOM.fileDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.fileDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelected(e.dataTransfer.files[0]);
        }
      });

      DOM.pdfFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (DOM.btnRemoveFile) {
      DOM.btnRemoveFile.addEventListener('click', (e) => {
        e.stopPropagation();
        clearSelectedFile();
      });
    }

    // Form Submission
    DOM.uploadNotesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleUploadSubmit();
    });
  }

  function handleFileSelected(file) {
    const errFile = document.getElementById('errFile');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      if (errFile) {
        errFile.textContent = 'Please select a valid PDF file (.pdf only).';
        errFile.classList.add('show');
      }
      return;
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      if (errFile) {
        errFile.textContent = 'PDF file exceeds maximum limit of 15MB.';
        errFile.classList.add('show');
      }
      return;
    }

    if (errFile) errFile.classList.remove('show');

    state.selectedFile = file;
    if (DOM.dropzonePrompt) DOM.dropzonePrompt.style.display = 'none';
    if (DOM.fileSelectedBox) DOM.fileSelectedBox.style.display = 'flex';
    if (DOM.selectedFilename) DOM.selectedFilename.textContent = file.name;
    if (DOM.selectedFilesize) DOM.selectedFilesize.textContent = formatBytes(file.size);
  }

  function clearSelectedFile() {
    state.selectedFile = null;
    if (DOM.pdfFileInput) DOM.pdfFileInput.value = '';
    if (DOM.fileSelectedBox) DOM.fileSelectedBox.style.display = 'none';
    if (DOM.dropzonePrompt) DOM.dropzonePrompt.style.display = 'flex';
  }

  async function handleUploadSubmit() {
    const title = document.getElementById('uploadTitle').value.trim();
    const branch = document.getElementById('uploadBranch').value;
    const semester = document.getElementById('uploadSemester').value;
    const subject = document.getElementById('uploadSubject').value.trim();
    const description = document.getElementById('uploadDescription').value.trim();
    const uploader = document.getElementById('uploadUploader').value.trim();

    let isValid = true;

    // Validate fields
    if (title.length < 5) {
      document.getElementById('errTitle').classList.add('show');
      isValid = false;
    } else {
      document.getElementById('errTitle').classList.remove('show');
    }

    if (!branch) {
      document.getElementById('errBranch').classList.add('show');
      isValid = false;
    } else {
      document.getElementById('errBranch').classList.remove('show');
    }

    if (!semester) {
      document.getElementById('errSemester').classList.add('show');
      isValid = false;
    } else {
      document.getElementById('errSemester').classList.remove('show');
    }

    if (!subject) {
      document.getElementById('errSubject').classList.add('show');
      isValid = false;
    } else {
      document.getElementById('errSubject').classList.remove('show');
    }

    if (!uploader) {
      document.getElementById('errUploader').classList.add('show');
      isValid = false;
    } else {
      document.getElementById('errUploader').classList.remove('show');
    }

    if (!state.selectedFile) {
      const errFile = document.getElementById('errFile');
      if (errFile) {
        errFile.textContent = 'Please choose a PDF file to upload.';
        errFile.classList.add('show');
      }
      isValid = false;
    }

    if (!isValid) return;

    // Toggle button loading state
    const submitBtn = document.getElementById('btnSubmitUpload');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    if (btnText) btnText.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    const newNote = {
      id: 'note-' + Date.now(),
      title,
      branch,
      semester,
      subject,
      description,
      uploader,
      downloads: 0,
      createdAt: new Date().toISOString().split('T')[0],
      fileName: state.selectedFile ? state.selectedFile.name : 'notes.pdf',
      fileSize: state.selectedFile ? formatBytes(state.selectedFile.size) : '2.5 MB'
    };

    // If backend online, send via multipart/form-data
    if (state.isBackendOnline) {
      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('branch', branch);
        formData.append('semester', semester);
        formData.append('subject', subject);
        formData.append('description', description);
        formData.append('uploaderName', uploader);
        if (state.selectedFile) {
          formData.append('file', state.selectedFile);
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.NOTES_ENDPOINT}`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const created = await response.json();
          state.notes.unshift(created);
          saveLocalNotes(state.notes);
          finishUpload(newNote.title);
          return;
        }
      } catch (err) {
        console.warn('Backend upload failed, saving note locally', err);
      }
    }

    // Save locally
    state.notes.unshift(newNote);
    saveLocalNotes(state.notes);
    finishUpload(newNote.title);
  }

  function finishUpload(title) {
    renderNotes();
    updateStats();

    // Reset Form
    DOM.uploadNotesForm.reset();
    clearSelectedFile();

    const submitBtn = document.getElementById('btnSubmitUpload');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    if (btnText) btnText.style.display = 'inline-block';
    if (spinner) spinner.style.display = 'none';
    submitBtn.disabled = false;

    closeModal(DOM.uploadModal);
    showToast('Upload Successful!', `"${title}" has been shared with your peers.`, 'success');

    // Scroll smoothly to browse section
    const browse = document.getElementById('browse-section');
    if (browse) {
      browse.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // -------------------------------------------------------------------------
  // Authentication Modal Flow
  // -------------------------------------------------------------------------
  function setupAuthFlow() {
    if (DOM.tabLoginBtn && DOM.tabRegisterBtn) {
      DOM.tabLoginBtn.addEventListener('click', () => {
        DOM.tabLoginBtn.classList.add('active');
        DOM.tabRegisterBtn.classList.remove('active');
        DOM.loginForm.style.display = 'block';
        DOM.registerForm.style.display = 'none';
      });

      DOM.tabRegisterBtn.addEventListener('click', () => {
        DOM.tabRegisterBtn.classList.add('active');
        DOM.tabLoginBtn.classList.remove('active');
        DOM.registerForm.style.display = 'block';
        DOM.loginForm.style.display = 'none';
      });
    }

    if (DOM.loginForm) {
      DOM.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (state.isBackendOnline) {
          try {
            const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            if (res.ok) {
              const user = await res.json();
              saveUserSession(user);
              closeModal(DOM.authModal);
              showToast('Welcome Back!', `Logged in as ${user.name}`, 'success');
              const uploaderInput = document.getElementById('uploadUploader');
              if (uploaderInput) uploaderInput.value = user.name;
              return;
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast('Login Failed', errData.error || 'Invalid email or password credentials.', 'danger');
              return;
            }
          } catch (err) {
            console.warn('Backend login error, falling back to local login', err);
          }
        }

        // Offline / Fallback mode
        const name = email.split('@')[0] || 'Student';
        const user = { name: capitalize(name), email, role: 'STUDENT' };
        saveUserSession(user);
        closeModal(DOM.authModal);
        showToast('Welcome Back!', `Logged in as ${user.name} (Local Mode)`, 'success');

        const uploaderInput = document.getElementById('uploadUploader');
        if (uploaderInput && !uploaderInput.value) {
          uploaderInput.value = user.name;
        }
      });
    }

    if (DOM.registerForm) {
      DOM.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        if (state.isBackendOnline) {
          try {
            const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password })
            });
            if (res.ok) {
              const user = await res.json();
              saveUserSession(user);
              closeModal(DOM.authModal);
              showToast('Registration Complete!', `Welcome to NotesHub, ${user.name}!`, 'success');
              const uploaderInput = document.getElementById('uploadUploader');
              if (uploaderInput) uploaderInput.value = user.name;
              return;
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast('Registration Error', errData.error || 'Failed to register account.', 'danger');
              return;
            }
          } catch (err) {
            console.warn('Backend register error, falling back to local', err);
          }
        }

        // Offline / Fallback mode
        const user = { name: name || 'Student', email, role: 'STUDENT' };
        saveUserSession(user);
        closeModal(DOM.authModal);
        showToast('Registration Complete!', `Welcome to NotesHub, ${user.name}! (Local Mode)`, 'success');

        const uploaderInput = document.getElementById('uploadUploader');
        if (uploaderInput) {
          uploaderInput.value = user.name;
        }
      });
    }
  }

  function updateAuthUI() {
    if (!DOM.authButtonText) return;
    if (state.currentUser) {
      DOM.authButtonText.textContent = state.currentUser.name;
      DOM.btnOpenAuthModal.title = `Logged in as ${state.currentUser.email} (Click to switch or logout)`;
    } else {
      DOM.authButtonText.textContent = 'Student Login';
      DOM.btnOpenAuthModal.title = 'Login or Register';
    }
  }

  // -------------------------------------------------------------------------
  // Modal Helpers (Accessible Open / Close)
  // -------------------------------------------------------------------------
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setupModals() {
    // Open Upload Modal
    const openUpload = () => {
      // Pre-fill user name if logged in
      if (state.currentUser) {
        const uploader = document.getElementById('uploadUploader');
        if (uploader && !uploader.value) uploader.value = state.currentUser.name;
      }
      openModal(DOM.uploadModal);
    };

    if (DOM.btnOpenUploadModal) DOM.btnOpenUploadModal.addEventListener('click', openUpload);
    if (DOM.heroUploadBtn) DOM.heroUploadBtn.addEventListener('click', openUpload);

    if (DOM.btnCloseUploadModal) DOM.btnCloseUploadModal.addEventListener('click', () => closeModal(DOM.uploadModal));
    if (DOM.btnCancelUpload) DOM.btnCancelUpload.addEventListener('click', () => closeModal(DOM.uploadModal));

    // Preview Modal Close
    if (DOM.btnClosePreviewModal) DOM.btnClosePreviewModal.addEventListener('click', () => closeModal(DOM.previewModal));
    if (DOM.btnClosePreviewBtn) DOM.btnClosePreviewBtn.addEventListener('click', () => closeModal(DOM.previewModal));

    // Modal Download button
    if (DOM.btnModalDownload) {
      DOM.btnModalDownload.addEventListener('click', () => {
        if (state.activePreviewNote) {
          handleDownload(state.activePreviewNote.id);
        }
      });
    }

    // Auth Modal Open/Close
    if (DOM.btnOpenAuthModal) {
      DOM.btnOpenAuthModal.addEventListener('click', () => {
        if (state.currentUser) {
          if (confirm(`You are currently logged in as ${state.currentUser.name} (${state.currentUser.email}).\n\nWould you like to logout?`)) {
            saveUserSession(null);
            showToast('Logged Out', 'You have successfully signed out.', 'info');
          }
          return;
        }
        openModal(DOM.authModal);
      });
    }
    if (DOM.btnCloseAuthModal) DOM.btnCloseAuthModal.addEventListener('click', () => closeModal(DOM.authModal));

    // Close on backdrop click
    [DOM.uploadModal, DOM.previewModal, DOM.authModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(DOM.uploadModal);
        closeModal(DOM.previewModal);
        closeModal(DOM.authModal);
      }
    });
  }

  // -------------------------------------------------------------------------
  // Filters, Search & Event Bindings
  // -------------------------------------------------------------------------
  function setupFiltersAndEvents() {
    // Search input with instant filter and clear button toggle
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        if (DOM.clearSearchBtn) {
          DOM.clearSearchBtn.style.display = e.target.value ? 'flex' : 'none';
        }
        renderNotes();
      });
    }

    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        state.filters.search = '';
        DOM.clearSearchBtn.style.display = 'none';
        renderNotes();
        DOM.searchInput.focus();
      });
    }

    // Branch filter
    if (DOM.filterBranch) {
      DOM.filterBranch.addEventListener('change', (e) => {
        state.filters.branch = e.target.value;
        renderNotes();
      });
    }

    // Semester filter
    if (DOM.filterSemester) {
      DOM.filterSemester.addEventListener('change', (e) => {
        state.filters.semester = e.target.value;
        renderNotes();
      });
    }

    // Sort filter
    if (DOM.filterSort) {
      DOM.filterSort.addEventListener('change', (e) => {
        state.filters.sortBy = e.target.value;
        renderNotes();
      });
    }

    // Reset filters buttons
    const resetAll = () => {
      state.filters.search = '';
      state.filters.branch = 'ALL';
      state.filters.semester = 'ALL';
      state.filters.sortBy = 'newest';

      if (DOM.searchInput) DOM.searchInput.value = '';
      if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = 'none';
      if (DOM.filterBranch) DOM.filterBranch.value = 'ALL';
      if (DOM.filterSemester) DOM.filterSemester.value = 'ALL';
      if (DOM.filterSort) DOM.filterSort.value = 'newest';

      renderNotes();
      showToast('Filters Reset', 'All branch and search filters have been cleared.', 'info');
    };

    if (DOM.btnResetFilters) DOM.btnResetFilters.addEventListener('click', resetAll);
    if (DOM.btnEmptyReset) DOM.btnEmptyReset.addEventListener('click', resetAll);

    // Active filter chips removal click delegation
    if (DOM.filterChipsContainer) {
      DOM.filterChipsContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.chip-remove');
        if (!removeBtn) return;
        const key = removeBtn.getAttribute('data-key');
        if (key === 'branch') {
          state.filters.branch = 'ALL';
          if (DOM.filterBranch) DOM.filterBranch.value = 'ALL';
        } else if (key === 'semester') {
          state.filters.semester = 'ALL';
          if (DOM.filterSemester) DOM.filterSemester.value = 'ALL';
        } else if (key === 'search') {
          state.filters.search = '';
          if (DOM.searchInput) DOM.searchInput.value = '';
          if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = 'none';
        }
        renderNotes();
      });
    }

    // Delegate Preview & Download button clicks in Notes Grid
    if (DOM.notesGrid) {
      DOM.notesGrid.addEventListener('click', (e) => {
        const previewBtn = e.target.closest('.btn-preview');
        if (previewBtn) {
          const noteId = previewBtn.getAttribute('data-id');
          openPreviewModal(noteId);
          return;
        }

        const downloadBtn = e.target.closest('.btn-download');
        if (downloadBtn) {
          const noteId = downloadBtn.getAttribute('data-id');
          handleDownload(noteId);
          return;
        }
      });
    }

    // Mobile Navbar Menu Toggle
    if (DOM.mobileMenuBtn && DOM.navMenu) {
      DOM.mobileMenuBtn.addEventListener('click', () => {
        DOM.navMenu.classList.toggle('open');
      });

      // Close mobile menu on link click
      DOM.navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          DOM.navMenu.classList.remove('open');
        });
      });
    }

    // Navbar scroll shadow effect
    window.addEventListener('scroll', () => {
      if (DOM.navbar) {
        if (window.scrollY > 30) {
          DOM.navbar.classList.add('scrolled');
        } else {
          DOM.navbar.classList.remove('scrolled');
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Toast System
  // -------------------------------------------------------------------------
  function showToast(title, message, type = 'info') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <h5 class="toast-title">${escapeHTML(title)}</h5>
        <p class="toast-message">${escapeHTML(message)}</p>
      </div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    DOM.toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Close on click
    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    };

    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    // Auto dismiss after 4 seconds
    setTimeout(dismiss, 4000);
  }

  // -------------------------------------------------------------------------
  // Utility Functions
  // -------------------------------------------------------------------------
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Oct 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // -------------------------------------------------------------------------
  // App Bootstrapper
  // -------------------------------------------------------------------------
  function bootstrap() {
    initDOM();
    state.notes = loadLocalNotes();
    loadUserSession();

    setupFiltersAndEvents();
    setupModals();
    setupUploadForm();
    setupAuthFlow();

    renderNotes();
    updateStats();

    // Check Spring Boot backend connectivity
    checkBackendStatus();
    setInterval(checkBackendStatus, API_CONFIG.CHECK_INTERVAL);
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
