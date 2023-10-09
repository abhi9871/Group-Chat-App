let passwordInput = document.getElementById('password');
let passwordLengthMsg = document.getElementById('passwordLengthMessage');

passwordInput.addEventListener('input', checkPasswordLength); // checks the length when user enters the password

// Check password length
function checkPasswordLength() {
    let password = passwordInput.value;
    if(password.length < 8 && password.length > 0){
        passwordLengthMsg.textContent = 'Password must be atleast 8 characters long';
    }
    else {
        passwordLengthMsg.textContent = '';
    }
}