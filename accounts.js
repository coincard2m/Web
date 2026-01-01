
// Kiểm tra nếu đã đăng nhập thì không cho vào trang login nữa
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('wb_currentUser');
    // Nếu đang ở trang login mà đã có user, đẩy qua dashboard
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
});

// Cập nhật hàm login để chuyển hướng đúng
function login(evt) {
    // ... code cũ của bạn ...
    if (user) {
        localStorage.setItem('wb_currentUser', JSON.stringify({ name: user.name, email: user.email }));
        window.location.href = 'dashboard.html'; // Chuyển vào dashboard
    }
}


(function () {
  const LS_ACCOUNTS = 'wb_accounts'; // Key lưu danh sách tài khoản
  const LS_CURRENT = 'wb_currentUser'; // Key lưu người dùng hiện tại

  // 1. Hàm lấy danh sách tài khoản từ máy tính người dùng
  function loadAccounts() {
    try {
      return JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '[]');
    } catch (e) {
      return [];
    }
  }

  // 2. Hàm lưu danh sách tài khoản
  function saveAccounts(list) {
    localStorage.setItem(LS_ACCOUNTS, JSON.stringify(list));
  }

  // 3. Hàm hiển thị thông báo đẹp (đồng bộ với giao diện)
  function showMsg(type, text) {
    const box = document.getElementById('msgBox');
    if (!box) return;
    
    // Xóa thông báo cũ nếu có
    box.innerHTML = `<div class="msg-${type}" style="
      padding: 12px; 
      border-radius: 10px; 
      margin-bottom: 15px; 
      font-size: 14px;
      text-align: center;
      background: ${type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(226, 43, 43, 0.2)'};
      color: ${type === 'success' ? '#2ecc71' : '#e22b2b'};
      border: 1px solid ${type === 'success' ? '#2ecc71' : '#e22b2b'};
    ">${text}</div>`;
    
    // Tự động xóa thông báo sau 3 giây
    setTimeout(() => { box.innerHTML = ''; }, 3000);
  }

  // --- XỬ LÝ ĐĂNG KÝ ---
  function register(evt) {
    evt.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pw = document.getElementById('regPassword').value;
    const pw2 = document.getElementById('regPassword2').value;

    if (!name || !email || !pw) {
      showMsg('error', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (pw !== pw2) {
      showMsg('error', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    const accounts = loadAccounts();
    // Kiểm tra xem email đã tồn tại chưa
    if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      showMsg('error', 'Email này đã được đăng ký!');
      return;
    }

    // Lưu tài khoản mới
    accounts.push({ name, email, password: pw });
    saveAccounts(accounts);
    
    showMsg('success', 'Đăng ký thành công! Hãy đăng nhập.');
    
    // Chuyển sang form đăng nhập sau 1.5 giây
    setTimeout(() => {
        document.getElementById('tabLogin').click();
    }, 1500);
  }

  // --- XỬ LÝ ĐĂNG NHẬP ---
  function login(evt) {
    evt.preventDefault();
    const email = document.getElementById('logEmail').value.trim();
    const pw = document.getElementById('logPassword').value;

    const accounts = loadAccounts();
    // Tìm tài khoản khớp email và password
    const user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === pw);

    if (user) {
      showMsg('success', `Chào mừng ${user.name} quay trở lại!`);
      // Lưu trạng thái đã đăng nhập
      localStorage.setItem(LS_CURRENT, JSON.stringify({ name: user.name, email: user.email }));
      
      // Chuyển hướng về trang chủ sau 1 giây
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 1000);
    } else {
      showMsg('error', 'Email hoặc mật khẩu không chính xác!');
    }
  }

  // --- KHỞI TẠO SỰ KIỆN ---
  document.addEventListener('DOMContentLoaded', () => {
    const lForm = document.getElementById('loginForm');
    const rForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    if (rForm) rForm.addEventListener('submit', register);
    if (lForm) lForm.addEventListener('submit', login);

    // Xử lý chuyển đổi Tab
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        lForm.style.display = 'block';
        rForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
      });

      tabRegister.addEventListener('click', () => {
        lForm.style.display = 'none';
        rForm.style.display = 'block';
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
      });
    }
  });
})();