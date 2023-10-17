const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', signUp);

// Initialize Toastr options
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

async function signUp(e) {
    e.preventDefault();
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');

    // Create signup object with user details
    const signupData = {
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value
    }

    try{
        const response = await axios.post('http://localhost:4000/user/signup', signupData);
        if(response.data.success){
            localStorage.setItem('isSignupSuccessful', true);
            signupForm.reset();
            window.location.href = 'http://127.0.0.1:5500/Frontend/html/login.html';
        }

    } catch(err){
        if(err.response && err.response.data && err.response.data.errors) {
        const error = err.response.data.errors;
        console.log(error);
        if(error.email){
            // Display an error message for email field
            toastr.error(error.email);
        }
        if(error.phone){
            // Display an error message for phone field
            toastr.error(error.phone);
        }
        if(error.password){
            // Display an error message for password field
            toastr.error(error.password);
        }
    }
        console.log(err);
    }
}