const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'http://127.0.0.1:5500/Frontend/html/login.html';
})