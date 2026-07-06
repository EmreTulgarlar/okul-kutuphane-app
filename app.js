/**
 * Yeditepe Üniversitesi - Bilgisayar Mühendisliği Kütüphanesi
 * Uygulama Mantığı ve State Yönetimi
 */

// Varsayılan Örnek Kitap Verileri (Eğer LocalStorage boşsa yüklenir)
const DEFAULT_BOOKS = [
  {
    id: 'CSE-101',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen',
    category: 'Yazılım & Algoritma',
    icon: '💻',
    status: 'available',
    borrowInfo: null
  },
  {
    id: 'CSE-102',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell & Peter Norvig',
    category: 'Yapay Zeka',
    icon: '🤖',
    status: 'borrowed',
    borrowInfo: {
      studentName: 'Zeynep Aksoy',
      studentNo: '202307045',
      studentEmail: 'zeynep.aksoy@std.yeditepe.edu.tr',
      borrowDate: '2026-06-10',
      dueDate: '2026-06-24' // Süresi geçmiş örnek
    }
  },
  {
    id: 'CSE-103',
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James F. Kurose',
    category: 'Donanım & Sistem',
    icon: '🌐',
    status: 'available',
    borrowInfo: null
  },
  {
    id: 'CSE-104',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Yazılım & Algoritma',
    icon: '⚡',
    status: 'borrowed',
    borrowInfo: {
      studentName: 'Kaan Yıldız',
      studentNo: '202207112',
      studentEmail: 'kaan.yildiz@std.yeditepe.edu.tr',
      borrowDate: '2026-06-20',
      dueDate: '2026-07-04'
    }
  },
  {
    id: 'CSE-105',
    title: 'Deep Learning',
    author: 'Ian Goodfellow & Yoshua Bengio',
    category: 'Yapay Zeka',
    icon: '🧠',
    status: 'available',
    borrowInfo: null
  },
  {
    id: 'CSE-106',
    title: 'Modern Operating Systems',
    author: 'Andrew S. Tanenbaum',
    category: 'Donanım & Sistem',
    icon: '🖥️',
    status: 'available',
    borrowInfo: null
  }
];

// Uygulama State'i
let state = {
  books: [],
  currentView: 'student', // 'student' veya 'admin'
  currentAdminTab: 'books', // 'books' veya 'loans'
  filterCategory: 'Tümü',
  searchQuery: '',
  isAdminAuthenticated: false, // Admin şifre doğrulama durumu
  theme: 'dark' // 'dark' veya 'light'
};

// Kategori İkon Haritası
const CATEGORY_ICONS = {
  'Yazılım & Algoritma': '💻',
  'Yapay Zeka': '🤖',
  'Donanım & Sistem': '🖥️',
  'Genel': '📚',
  'Varsayılan': '🦅'
};

/**
 * Başlangıç ve Veri Yükleme
 */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTheme();
  renderAll();
});

function loadState() {
  const savedData = localStorage.getItem('yeditepe_cse_kutuphane_books');
  if (savedData) {
    try {
      state.books = JSON.parse(savedData);
    } catch (e) {
      console.error('Veri yükleme hatası:', e);
      state.books = [...DEFAULT_BOOKS];
    }
  } else {
    state.books = [...DEFAULT_BOOKS];
    saveState();
  }
}

function saveState() {
  localStorage.setItem('yeditepe_cse_kutuphane_books', JSON.stringify(state.books));
  updateStats();
}

/**
 * Tema Yönetimi (Gece / Gündüz Modu - Sadece İkon)
 */
function initTheme() {
  const savedTheme = localStorage.getItem('yeditepe_theme') || 'dark';
  setTheme(savedTheme);
}

function toggleTheme() {
  const newTheme = state.theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function setTheme(themeName) {
  state.theme = themeName;
  localStorage.setItem('yeditepe_theme', themeName);

  if (themeName === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('theme-icon').textContent = '🌙';
  } else {
    document.body.classList.remove('light-theme');
    document.getElementById('theme-icon').textContent = '☀️';
  }
  
  switchAdminTab(state.currentAdminTab); // Buton renklerini temaya göre yenile
}

/**
 * Şifre & Yönetici Erişimi
 */
function getAdminPassword() {
  return localStorage.getItem('yeditepe_admin_pwd') || 'yeditepe';
}

function requestAdminAccess() {
  if (state.isAdminAuthenticated) {
    switchView('admin');
  } else {
    document.getElementById('admin-password-input').value = '';
    openModal('password-modal');
    setTimeout(() => {
      document.getElementById('admin-password-input').focus();
    }, 100);
  }
}

function verifyAdminPassword(event) {
  event.preventDefault();
  const inputPwd = document.getElementById('admin-password-input').value;
  
  if (inputPwd === getAdminPassword()) {
    state.isAdminAuthenticated = true;
    closeModal('password-modal');
    switchView('admin');
  } else {
    alert('⚠️ Hatalı şifre girdiniz! Lütfen tekrar deneyiniz.');
    document.getElementById('admin-password-input').value = '';
    document.getElementById('admin-password-input').focus();
  }
}

function openChangePasswordModal() {
  document.getElementById('old-pwd-input').value = '';
  document.getElementById('new-pwd-input').value = '';
  document.getElementById('confirm-pwd-input').value = '';
  openModal('change-password-modal');
}

function handleChangePassword(event) {
  event.preventDefault();
  
  const oldPwd = document.getElementById('old-pwd-input').value;
  const newPwd = document.getElementById('new-pwd-input').value;
  const confirmPwd = document.getElementById('confirm-pwd-input').value;

  if (oldPwd !== getAdminPassword()) {
    alert('⚠️ Mevcut şifrenizi yanlış girdiniz!');
    return;
  }

  if (newPwd !== confirmPwd) {
    alert('⚠️ Yeni şifreler birbirisiyle uyuşmuyor!');
    return;
  }

  if (newPwd.length < 4) {
    alert('⚠️ Yeni şifre en az 4 karakter uzunluğunda olmalıdır.');
    return;
  }

  localStorage.setItem('yeditepe_admin_pwd', newPwd);
  alert('✅ Yönetici şifreniz başarıyla güncellendi!');
  closeModal('change-password-modal');
}

/**
 * Ekran ve Sekme Değiştirme
 */
function switchView(viewName) {
  state.currentView = viewName;
  
  // Buton aktiflik durumlarını güncelle
  document.getElementById('btn-student-view').classList.toggle('active', viewName === 'student');
  document.getElementById('btn-admin-view').classList.toggle('active', viewName === 'admin');
  
  // Ekran görünürlüğünü ayarla
  document.getElementById('student-view').classList.toggle('active', viewName === 'student');
  document.getElementById('admin-view').classList.toggle('active', viewName === 'admin');

  renderAll();
}

function switchAdminTab(tabName) {
  state.currentAdminTab = tabName;
  
  const btnBooks = document.getElementById('admin-tab-books');
  const btnLoans = document.getElementById('admin-tab-loans');
  
  const activeBg = state.theme === 'light' ? 'rgba(37,99,235,0.15)' : 'rgba(59,130,246,0.2)';
  const inactiveBg = state.theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.08)';

  if (tabName === 'books') {
    btnBooks.style.borderColor = 'var(--accent-primary)';
    btnBooks.style.background = activeBg;
    btnLoans.style.borderColor = 'var(--border-glass)';
    btnLoans.style.background = inactiveBg;
    
    document.getElementById('admin-books-section').style.display = 'block';
    document.getElementById('admin-loans-section').style.display = 'none';
  } else {
    btnLoans.style.borderColor = 'var(--accent-primary)';
    btnLoans.style.background = activeBg;
    btnBooks.style.borderColor = 'var(--border-glass)';
    btnBooks.style.background = inactiveBg;
    
    document.getElementById('admin-books-section').style.display = 'none';
    document.getElementById('admin-loans-section').style.display = 'block';
  }
  
  renderAll();
}

/**
 * Arama ve Filtreleme
 */
function handleSearch() {
  state.searchQuery = document.getElementById('search-input').value.trim().toLowerCase();
  renderAll();
}

function filterByCategory(category, btnElement) {
  state.filterCategory = category;
  
  // Buton sınıflarını güncelle
  const buttons = document.querySelectorAll('#category-filters .filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  
  renderAll();
}

function getFilteredBooks() {
  return state.books.filter(book => {
    const matchesCategory = state.filterCategory === 'Tümü' || book.category === state.filterCategory;
    const matchesSearch = !state.searchQuery || 
      book.title.toLowerCase().includes(state.searchQuery) ||
      book.author.toLowerCase().includes(state.searchQuery) ||
      book.id.toLowerCase().includes(state.searchQuery);
      
    return matchesCategory && matchesSearch;
  });
}

/**
 * İstatistikleri Hesapla ve Ekranı Güncelle
 */
function updateStats() {
  const total = state.books.length;
  const available = state.books.filter(b => b.status === 'available').length;
  const borrowed = state.books.filter(b => b.status === 'borrowed').length;
  
  // Geciken kitapları hesapla
  const today = new Date().toISOString().split('T')[0];
  const overdue = state.books.filter(b => b.status === 'borrowed' && b.borrowInfo && b.borrowInfo.dueDate < today).length;

  document.getElementById('stat-total-books').textContent = total;
  document.getElementById('stat-available-books').textContent = available;
  document.getElementById('stat-borrowed-books').textContent = borrowed;
  document.getElementById('stat-overdue-books').textContent = overdue;
}

/**
 * Tüm Arayüzleri Yeniden Çiz (Render)
 */
function renderAll() {
  updateStats();
  
  if (state.currentView === 'student') {
    renderStudentGrid();
  } else {
    renderAdminBooksTable();
    renderAdminLoansTable();
  }
}

/**
 * 🎓 ÖĞRENCİ VİTRİNİ RENDER
 */
function renderStudentGrid() {
  const grid = document.getElementById('student-books-grid');
  const filtered = getFilteredBooks();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">🔍</div>
        <h3>Aradığınız kriterlere uygun kitap bulunamadı.</h3>
        <p>Lütfen arama kelimenizi veya filtreleri değiştirerek tekrar deneyin.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(book => {
    const isAvailable = book.status === 'available';
    const statusClass = isAvailable ? 'available' : 'borrowed';
    const statusText = isAvailable ? 'Kütüphanede (Rafta)' : 'Ödünç Verildi';
    
    let borrowDetailsHtml = '';
    if (!isAvailable && book.borrowInfo) {
      const today = new Date().toISOString().split('T')[0];
      const isOverdue = book.borrowInfo.dueDate < today;
      const dueDateFormatted = formatDate(book.borrowInfo.dueDate);
      
      borrowDetailsHtml = `
        <div class="borrow-info-box" style="${isOverdue ? 'border-color: #ef4444; background: rgba(239,68,68,0.1);' : ''}">
          <div>Tahmini Dönüş: <strong>${dueDateFormatted}</strong></div>
          ${isOverdue ? '<div style="color: #ef4444; font-weight: 600; font-size: 0.8rem;">⚠️ İade Süresi Gecikti</div>' : ''}
        </div>
      `;
    }

    return `
      <div class="book-card">
        <div>
          <div class="book-header">
            <div class="book-cover-icon">${book.icon || CATEGORY_ICONS[book.category] || '📚'}</div>
            <span class="book-id-badge">${book.id}</span>
          </div>
          <h3 class="book-title">${book.title}</h3>
          <div class="book-author">✍️ ${book.author}</div>
          <span class="book-category">${book.category}</span>
        </div>
        
        <div class="book-status-area">
          <div class="status-badge ${statusClass}">
            <span class="status-dot"></span>
            <span>${statusText}</span>
          </div>
          ${borrowDetailsHtml}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 🔐 ADMİN PANELS RENDER
 */
function renderAdminBooksTable() {
  const tbody = document.getElementById('admin-books-tbody');
  const filtered = getFilteredBooks();

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--text-muted);">Kayıtlı kitap bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(book => {
    const isAvailable = book.status === 'available';
    const statusBadge = isAvailable 
      ? `<span class="status-badge available" style="padding: 4px 10px; font-size:0.75rem;"><span class="status-dot"></span> Kütüphanede</span>`
      : `<span class="status-badge borrowed" style="padding: 4px 10px; font-size:0.75rem;"><span class="status-dot"></span> Ödünçte</span>`;

    return `
      <tr>
        <td style="font-weight: 700; color: #3b82f6;">${book.id}</td>
        <td style="font-weight: 600;">${book.icon || '📚'} ${book.title}</td>
        <td>${book.author}</td>
        <td><span class="book-category" style="margin:0;">${book.category}</span></td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            ${isAvailable 
              ? `<button class="btn-action btn-success" onclick="openLendModal('${book.id}')">📤 Ödünç Ver</button>`
              : `<button class="btn-action btn-secondary" onclick="returnBook('${book.id}')">📥 İade Al</button>`
            }
            <button class="btn-action btn-secondary" onclick="openEditBookModal('${book.id}')">✏️</button>
            <button class="btn-action btn-danger" onclick="deleteBook('${book.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAdminLoansTable() {
  const tbody = document.getElementById('admin-loans-tbody');
  const borrowedBooks = state.books.filter(b => b.status === 'borrowed' && b.borrowInfo);

  if (borrowedBooks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">Şu an ödünç verilmiş aktif kitap bulunmuyor.</td></tr>`;
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  tbody.innerHTML = borrowedBooks.map(book => {
    const info = book.borrowInfo;
    const isOverdue = info.dueDate < today;

    return `
      <tr style="${isOverdue ? 'background: rgba(239,68,68,0.05);' : ''}">
        <td style="font-weight: 700; color: #3b82f6;">${book.id}</td>
        <td style="font-weight: 600;">${book.title}</td>
        <td style="color: #2563eb; font-weight: 600;">👤 ${info.studentName}</td>
        <td>#${info.studentNo}</td>
        <td><a href="mailto:${info.studentEmail || ''}" style="color: inherit; text-decoration: none;">📧 ${info.studentEmail || '-'}</a></td>
        <td>${formatDate(info.borrowDate)}</td>
        <td>
          <span style="${isOverdue ? 'color: #ef4444; font-weight:700;' : ''}">
            ${formatDate(info.dueDate)}
            ${isOverdue ? ' (Gecikti)' : ''}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-success" style="padding: 6px 14px; font-size: 0.85rem;" onclick="returnBook('${book.id}')">
            📥 Kitabı İade Al
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * MODAL VE İŞLEM YÖNETİMİ
 */
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// 1. Kitap Ekle / Düzenle
function openAddBookModal() {
  document.getElementById('book-modal-title').textContent = 'Yeni Kitap Ekle';
  document.getElementById('edit-book-id').value = '';
  document.getElementById('book-id-input').value = '';
  document.getElementById('book-id-input').disabled = false;
  document.getElementById('book-title-input').value = '';
  document.getElementById('book-author-input').value = '';
  document.getElementById('book-category-input').value = 'Yazılım & Algoritma';
  openModal('book-modal');
}

function openEditBookModal(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;

  document.getElementById('book-modal-title').textContent = 'Kitabı Düzenle';
  document.getElementById('edit-book-id').value = book.id;
  document.getElementById('book-id-input').value = book.id;
  document.getElementById('book-id-input').disabled = true; // ID değiştirilemez
  document.getElementById('book-title-input').value = book.title;
  document.getElementById('book-author-input').value = book.author;
  document.getElementById('book-category-input').value = book.category;
  
  openModal('book-modal');
}

function handleSaveBook(event) {
  event.preventDefault();
  
  const editId = document.getElementById('edit-book-id').value;
  const id = document.getElementById('book-id-input').value.trim().toUpperCase();
  const title = document.getElementById('book-title-input').value.trim();
  const author = document.getElementById('book-author-input').value.trim();
  const category = document.getElementById('book-category-input').value;
  const icon = CATEGORY_ICONS[category] || '📚';

  if (!id || !title || !author) {
    alert('Lütfen tüm zorunlu alanları doldurun.');
    return;
  }

  if (editId) {
    // Düzenleme modu
    const index = state.books.findIndex(b => b.id === editId);
    if (index !== -1) {
      state.books[index].title = title;
      state.books[index].author = author;
      state.books[index].category = category;
      state.books[index].icon = icon;
    }
  } else {
    // Yeni ekleme modu: ID benzersiz olmalı
    if (state.books.some(b => b.id === id)) {
      alert(`Hata: '${id}' koduna sahip bir kitap zaten sistemde kayıtlı!`);
      return;
    }

    state.books.push({
      id,
      title,
      author,
      category,
      icon,
      status: 'available',
      borrowInfo: null
    });
  }

  saveState();
  closeModal('book-modal');
  renderAll();
}

function deleteBook(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;

  if (book.status === 'borrowed') {
    alert('Bu kitap şu an bir öğrencide ödünç bulunduğu için silinemez. Önce iade alınız!');
    return;
  }

  if (confirm(`"${book.title}" kitabını envanterden silmek istediğinize emin misiniz?`)) {
    state.books = state.books.filter(b => b.id !== bookId);
    saveState();
    renderAll();
  }
}

// 2. Ödünç Verme İşlemleri
function openLendModal(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book || book.status !== 'available') return;

  document.getElementById('lend-book-id').value = book.id;
  document.getElementById('lend-book-display').textContent = `${book.id} - ${book.title} (${book.author})`;
  document.getElementById('student-name-input').value = '';
  document.getElementById('student-no-input').value = '';
  document.getElementById('student-email-input').value = '';
  document.getElementById('borrow-days-input').value = '14';
  
  openModal('lend-modal');
}

function handleLendBook(event) {
  event.preventDefault();
  
  const bookId = document.getElementById('lend-book-id').value;
  const studentName = document.getElementById('student-name-input').value.trim();
  const studentNo = document.getElementById('student-no-input').value.trim();
  const studentEmail = document.getElementById('student-email-input').value.trim();
  const borrowDays = parseInt(document.getElementById('borrow-days-input').value, 10) || 14;

  const bookIndex = state.books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) return;

  const now = new Date();
  const borrowDate = now.toISOString().split('T')[0];
  
  const due = new Date();
  due.setDate(now.getDate() + borrowDays);
  const dueDate = due.toISOString().split('T')[0];

  state.books[bookIndex].status = 'borrowed';
  state.books[bookIndex].borrowInfo = {
    studentName,
    studentNo,
    studentEmail,
    borrowDate,
    dueDate
  };

  saveState();
  closeModal('lend-modal');
  renderAll();
}

// 3. İade Alma İşlemi
function returnBook(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book || book.status !== 'borrowed') return;

  if (confirm(`"${book.title}" kitabı ${book.borrowInfo.studentName} adlı öğrenciden iade alındı olarak işaretlenecek. Onaylıyor musunuz?`)) {
    book.status = 'available';
    book.borrowInfo = null;
    
    saveState();
    renderAll();
  }
}

/**
 * Yedekleme / Dışa Aktarma (JSON Export)
 */
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.books, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `yeditepe_kutuphane_yedek_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedBooks = JSON.parse(e.target.result);
      if (!Array.isArray(importedBooks)) {
        throw new Error("Geçersiz format");
      }
      state.books = importedBooks;
      saveState();
      renderAll();
      alert("Yedek başarıyla yüklendi!");
    } catch (err) {
      alert("Yüklenen dosya geçersiz bir kütüphane yedeği. Lütfen doğru bir JSON dosyası seçin.");
    }
    event.target.value = ''; // Reset input
  };
  reader.readAsText(file);
}

/**
 * Yardımcı Araçlar: Tarih Formatlama (YYYY-MM-DD -> DD.MM.YYYY)
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}
