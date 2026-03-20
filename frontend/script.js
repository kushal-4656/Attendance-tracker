// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time validation
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            validateUsername(this.value);
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
            updatePasswordRequirements(this.value);
        });
        
        // Show password requirements when password field is focused
        passwordInput.addEventListener('focus', function() {
            document.getElementById('passwordRequirements').style.display = 'block';
        });
        
        // Hide password requirements when password field is blurred and empty
        passwordInput.addEventListener('blur', function() {
            if (this.value === '') {
                document.getElementById('passwordRequirements').style.display = 'none';
            }
        });
    }
    
    // Add floating animation to container
    animateContainer();
    
    // Check device type and adjust accordingly
    checkDeviceType();
    
    // Add resize listener for responsive adjustments
    window.addEventListener('resize', debounce(handleResize, 250));
});

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
function handleResize() {
    checkDeviceType();
    adjustLayout();
}

// Check device type
function checkDeviceType() {
    const width = window.innerWidth;
    const container = document.querySelector('.container');
    
    if (width <= 575.98) {
        container.style.padding = '20px 15px';
    } else if (width <= 767.98) {
        container.style.padding = '25px';
    } else {
        container.style.padding = '30px';
    }
}

// Adjust layout
function adjustLayout() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    
    if (height < 600 && width > height) {
        document.body.style.alignItems = 'flex-start';
    } else {
        document.body.style.alignItems = 'center';
    }
}

// Form validation function
async function validateForm(event) {

    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    
    if (isUsernameValid && isPasswordValid) {

        showLoading();

        try {

            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            hideLoading();

            if (response.ok) {
    localStorage.setItem("faculty_id", data.faculty_id);
    localStorage.setItem("faculty_name", data.name);            
    showToast("Login successful!", "success");

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1200);

            } else {
                showToast(data.detail || "Invalid credentials", "error");
            }

        } catch (error) {

            hideLoading();
            showToast("Server error. Try again.", "error");

        }
    }

    return false;
}


        

// Validate username (non-empty and at least 3 characters)
function validateUsername(username) {
    const usernameGroup = document.getElementById('username').parentElement;
    
    if (!username) {
        showError(usernameGroup, 'Username is required');
        return false;
    } else if (username.length < 3) {
        showError(usernameGroup, 'Username must be at least 3 characters');
        return false;
    } else if (username.length > 20) {
        showError(usernameGroup, 'Username must be less than 20 characters');
        return false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        showError(usernameGroup, 'Username can only contain letters, numbers, dash and underscores');
        return false;
    } else {
        showSuccess(usernameGroup);
        return true;
    }
}

// Validate password with new requirements
function validatePassword(password) {
    const passwordGroup = document.getElementById('password').parentElement;
    
    // Check all requirements
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!password) {
        showError(passwordGroup, 'Password is required');
        return false;
    } else if (!hasLength) {
        showError(passwordGroup, 'Password must be at least 8 characters');
        return false;
    } else if (!hasUpperCase) {
        showError(passwordGroup, 'Password must contain an uppercase letter');
        return false;
    } else if (!hasLowerCase) {
        showError(passwordGroup, 'Password must contain a lowercase letter');
        return false;
    } else if (!hasNumber) {
        showError(passwordGroup, 'Password must contain a number');
        return false;
    } else if (!hasSpecial) {
        showError(passwordGroup, 'Password must contain a special character');
        return false;
    } else {
        showSuccess(passwordGroup);
        return true;
    }
}

// Update password requirements visual indicator
function updatePasswordRequirements(password) {
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');
    
    // Check each requirement
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Update classes
    updateRequirement(reqLength, hasLength);
    updateRequirement(reqUppercase, hasUpperCase);
    updateRequirement(reqLowercase, hasLowerCase);
    updateRequirement(reqNumber, hasNumber);
    updateRequirement(reqSpecial, hasSpecial);
}

// Update individual requirement
function updateRequirement(element, isMet) {
    if (isMet) {
        element.classList.remove('unmet');
        element.classList.add('met');
    } else {
        element.classList.remove('met');
        element.classList.add('unmet');
    }
}

// Show error state
function showError(element, message) {
    element.classList.add('error');
    element.classList.remove('success');
    
    let errorDiv = element.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

// Show success state
function showSuccess(element) {
    element.classList.remove('error');
    element.classList.add('success');
}

// Remove all validation classes
function removeValidationClasses() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const checkbox = document.getElementById('showPassword');
    
    if (checkbox.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Forgot password functionality
function forgotPassword() {
    const username = document.getElementById('username').value.trim();
    
    if (username && validateUsername(username)) {
        showToast('Password reset link sent to your registered email!', 'success');
    } else {
        showToast('Please enter a valid username first.', 'error');
    }
}

// Register functionality
function register() {
    showToast('Redirecting to registration page...', 'success');
    setTimeout(() => {
        showToast('Please create an account with a strong password!', 'info');
    }, 1500);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show loading state
function showLoading() {
    const btn = document.getElementById('btn');
    const overlay = document.getElementById('loadingOverlay');
    
    btn.classList.add('loading');
    btn.disabled = true;
    
    if (window.innerWidth <= 768) {
        overlay.classList.add('show');
    }
}

// Hide loading state
function hideLoading() {
    const btn = document.getElementById('btn');
    const overlay = document.getElementById('loadingOverlay');
    
    btn.classList.remove('loading');
    btn.disabled = false;
    overlay.classList.remove('show');
}

// Animate container
function animateContainer() {
    const container = document.querySelector('.container');
    let angle = 0;
    
    setInterval(() => {
        angle = (angle + 0.5) % 360;
        container.style.boxShadow = `0 0 30px rgba(255, 215, 0, ${0.3 + Math.sin(angle * Math.PI / 180) * 0.2})`;
    }, 50);
}

// Add keyboard support
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const form = document.getElementById('loginForm');
        if (form) {
            validateForm(e);
        }
    }
});

// Add input field effects
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', function() {
        if (window.innerWidth > 768) {
            this.parentElement.style.transform = 'scale(1.02)';
        }
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Prevent form submission on enter key
document.getElementById('loginForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Touch event handling for mobile
document.addEventListener('touchstart', function() {
    document.body.classList.add('touch-device');
});

// Orientation change handling
window.addEventListener('orientationchange', function() {
    setTimeout(adjustLayout, 100);
});