// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get input elements
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
const nameInput=document.getElementById('name');    
    // Add input event listeners for real-time validation
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            validateName(this.value);
        });
    }
    
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            validateUsername(this.value);
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
            updatePasswordRequirements(this.value);
            updatePasswordStrength(this.value);
        });
        
        // Show password requirements when password field is focused
        passwordInput.addEventListener('focus', function() {
            document.getElementById('passwordRequirements').style.display = 'block';
        });
    }
    
    // Check device type
    checkDeviceType();
    
    // Add resize listener
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
}

// Check device type
function checkDeviceType() {
    const width = window.innerWidth;
    const container = document.querySelector('.container');
    
    if (width <= 480) {
        container.style.padding = '25px 15px';
    } else if (width <= 768) {
        container.style.padding = '30px 20px';
    } else {
        container.style.padding = '40px';
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');
    
    if (showPasswordCheckbox.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Form validation function
async function validateForm(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value.trim();
    // Validate all fields
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const nameValid=validateName(name);
    // If all are valid, proceed with registration
    if (isUsernameValid && isPasswordValid&& nameValid) {
        showLoading();
        try {

            const response = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name:name,
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            hideLoading();

            if (response.ok) {
    

    showToast("registered successful!", "success");

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1200);
            }else {
    showToast(data.detail || "Registration failed", "error");
}
            } 


         catch (error) {

            hideLoading();
            showToast("Server error. Try again.", "error");

        }
    }

    return false;
}



// Validate username
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
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError(usernameGroup, 'Username can only contain letters, numbers, and underscores');
        return false;
    } else {
        showSuccess(usernameGroup);
        return true;
    }
}

// Validate password with all requirements
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

function validateName(name) {
    const nameGroup = document.getElementById('name').parentElement;
    
    if (!name) {
        showError(nameGroup, 'name is required');
        return false;
    } else if (name.length < 3) {
        showError(nameGroup, 'name must be at least 3 characters');
        return false;
    } 
    else {
        showSuccess(nameGroup);
        return true;
    }
}
// Show error on form group
function showError(formGroup, message) {
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Show success on form group
function showSuccess(formGroup) {
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
}

// Remove all validation classes
function removeValidationClasses() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });
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
    
    // Update classes with icons
    updateRequirement(reqLength, hasLength, 'fa-circle', hasLength ? 'fa-circle-check' : 'fa-circle-xmark');
    updateRequirement(reqUppercase, hasUpperCase, 'fa-circle', hasUpperCase ? 'fa-circle-check' : 'fa-circle-xmark');
    updateRequirement(reqLowercase, hasLowerCase, 'fa-circle', hasLowerCase ? 'fa-circle-check' : 'fa-circle-xmark');
    updateRequirement(reqNumber, hasNumber, 'fa-circle', hasNumber ? 'fa-circle-check' : 'fa-circle-xmark');
    updateRequirement(reqSpecial, hasSpecial, 'fa-circle', hasSpecial ? 'fa-circle-check' : 'fa-circle-xmark');
}

// Update individual requirement with icons
function updateRequirement(element, isMet, defaultIcon, newIcon) {
    const icon = element.querySelector('i');
    if (isMet) {
        element.classList.remove('unmet');
        element.classList.add('met');
        icon.className = 'fa-regular ' + newIcon;
    } else {
        element.classList.remove('met');
        element.classList.add('unmet');
        icon.className = 'fa-regular ' + (defaultIcon || 'fa-circle');
    }
}

// Update password strength meter
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    
    // Calculate strength score
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    // Update strength bar
    strengthBar.style.width = (strength * 20) + '%';
    
    // Update strength text and color
    let strengthLevel = 'Weak';
    let strengthColor = '#dc3545';
    
    if (strength >= 4) {
        strengthLevel = 'Strong';
        strengthColor = '#28a745';
    } else if (strength >= 3) {
        strengthLevel = 'Medium';
        strengthColor = '#ffc107';
    }
    
    strengthBar.style.backgroundColor = strengthColor;
    strengthText.textContent = strengthLevel + ' Password';
    strengthText.style.color = strengthColor;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}