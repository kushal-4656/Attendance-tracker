// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get password input elements
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            validateNewPassword(this.value);
            updatePasswordRequirements(this.value);
            updatePasswordStrength(this.value);
            // Also validate confirm password when password changes
            if (confirmNewPasswordInput && confirmNewPasswordInput.value) {
                validateConfirmNewPassword(confirmNewPasswordInput.value);
            }
        });
        
        // Show password requirements when password field is focused
        newPasswordInput.addEventListener('focus', function() {
            document.getElementById('passwordRequirements').style.display = 'block';
        });
    }
    
    if (confirmNewPasswordInput) {
        confirmNewPasswordInput.addEventListener('input', function() {
            validateConfirmNewPassword(this.value);
        });
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('successModal');
        if (event.target == modal) {
            closeModal();
        }
    }
});

// Reset password function
async function resetPassword(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validate all fields
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validateNewPassword(newPassword);
    const isConfirmValid = validateConfirmNewPassword(confirmNewPassword);
    
    if (isUsernameValid && isPasswordValid && isConfirmValid) {
        showLoading();
      try {

            const response = await fetch("http://127.0.0.1:8000/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    newPassword: newPassword,
                confirmNewPassword:confirmNewPassword
                })
            });

            const data = await response.json();

            hideLoading();

            if (response.ok) {

                showToast("Login successful!", "success");

                setTimeout(() => {
                    window.location.href = "index.html";
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
        
// Validate username
function validateUsername(username) {
    const usernameGroup = document.getElementById('username').parentElement;
    
    if (!username) {
        showError(usernameGroup, 'Username is required');
        return false;
    } else if (username.length < 3) {
        showError(usernameGroup, 'Username must be at least 3 characters');
        return false;
    } else {
        showSuccess(usernameGroup);
        return true;
    }
}

// Validate new password with all requirements
function validateNewPassword(password) {
    const passwordGroup = document.getElementById('newPassword').parentElement;
    
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

// Validate confirm new password
function validateConfirmNewPassword(confirmPassword) {
    const confirmGroup = document.getElementById('confirmNewPassword').parentElement;
    const password = document.getElementById('newPassword').value;
    
    if (!confirmPassword) {
        showError(confirmGroup, 'Please confirm your password');
        return false;
    } else if (confirmPassword !== password) {
        showError(confirmGroup, 'Passwords do not match');
        return false;
    } else {
        showSuccess(confirmGroup);
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
    
    // Update classes with icons
    updateRequirement(reqLength, hasLength);
    updateRequirement(reqUppercase, hasUpperCase);
    updateRequirement(reqLowercase, hasLowerCase);
    updateRequirement(reqNumber, hasNumber);
    updateRequirement(reqSpecial, hasSpecial);
}

// Update individual requirement
function updateRequirement(element, isMet) {
    const icon = element.querySelector('i');
    if (isMet) {
        element.classList.remove('unmet');
        element.classList.add('met');
        if (icon) {
            icon.className = 'fa-regular fa-circle-check';
        }
    } else {
        element.classList.remove('met');
        element.classList.add('unmet');
        if (icon) {
            icon.className = 'fa-regular fa-circle';
        }
    }
}

// Update password strength meter
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    // Check each requirement
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Count how many requirements are met
    const requirementsMet = [hasLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
    
    // Update strength bar based on requirements met
    strengthBar.className = 'strength-bar';
    
    if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthText.textContent = 'Password Strength';
    } else if (requirementsMet <= 2) {
        strengthBar.classList.add('very-weak');
        strengthText.textContent = 'Very Weak';
    } else if (requirementsMet === 3) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak';
    } else if (requirementsMet === 4) {
        strengthBar.classList.add('fair');
        strengthText.textContent = 'Fair';
    } else if (requirementsMet === 5) {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong';
    }
}

// Reset password requirements
function resetPasswordRequirements() {
    const requirements = ['req-length', 'req-uppercase', 'req-lowercase', 'req-number', 'req-special'];
    requirements.forEach(reqId => {
        const element = document.getElementById(reqId);
        element.classList.remove('met', 'unmet');
        const icon = element.querySelector('i');
        if (icon) {
            icon.className = 'fa-regular fa-circle';
        }
    });
    
    // Reset strength meter
    document.getElementById('strengthBar').style.width = '0%';
    document.getElementById('strengthBar').className = 'strength-bar';
    document.getElementById('strengthText').textContent = 'Password Strength';
    
    // Hide password requirements
    document.getElementById('passwordRequirements').style.display = 'none';
}

// Show error state
function showError(element, message) {
    element.classList.add('error');
    element.classList.remove('success');
    
    let errorDiv = element.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Show success state
function showSuccess(element) {
    element.classList.remove('error');
    element.classList.add('success');
    
    let errorDiv = element.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Remove all validation classes
function removeValidationClasses() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
        
        let errorDiv = group.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    });
}

// Toggle password visibility
function togglePassword() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const checkbox = document.getElementById('showPassword');
    const icon = checkbox.nextElementSibling.querySelector('i');
    
    if (checkbox.checked) {
        newPasswordInput.type = 'text';
        confirmNewPasswordInput.type = 'text';
        if (icon) {
            icon.className = 'fa-regular fa-eye-slash';
        }
    } else {
        newPasswordInput.type = 'password';
        confirmNewPasswordInput.type = 'password';
        if (icon) {
            icon.className = 'fa-regular fa-eye';
        }
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
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
    const btn = document.getElementById('resetBtn');
    const overlay = document.getElementById('loadingOverlay');
    
    btn.classList.add('loading');
    btn.disabled = true;
    
    if (window.innerWidth <= 768) {
        overlay.classList.add('show');
    }
}

// Hide loading state
function hideLoading() {
    const btn = document.getElementById('resetBtn');
    const overlay = document.getElementById('loadingOverlay');
    
    btn.classList.remove('loading');
    btn.disabled = false;
    overlay.classList.remove('show');
}

// Prevent form submission on enter key
document.getElementById('forgotPasswordForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('successModal');
        if (modal.classList.contains('show')) {
            closeModal();
        }
    }
});