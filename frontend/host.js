// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async function() {
    await loadDepartments();
    
    // Add validation listeners
    document.getElementById('fullName').addEventListener('input', () => validateName());
    document.getElementById('email').addEventListener('input', () => validateEmail());
    document.getElementById('phone').addEventListener('input', () => validatePhone());
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select')) {
            document.querySelector('.select-options')?.classList.remove('show');
            document.querySelector('.select-trigger')?.classList.remove('active');
        }
    });
});

// Toggle dropdown
function toggleDropdown() {
    const options = document.querySelector('.select-options');
    const trigger = document.querySelector('.select-trigger');
    
    options.classList.toggle('show');
    trigger.classList.toggle('active');
}

// Select option
function selectOption(value, text) {
    document.querySelector('.select-value').textContent = text;
    document.getElementById('department').value = value;
    
    // Update selected class
    document.querySelectorAll('.select-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.getAttribute('data-value') === value) {
            opt.classList.add('selected');
        }
    });
    
    // Close dropdown
    document.querySelector('.select-options').classList.remove('show');
    document.querySelector('.select-trigger').classList.remove('active');
    
    // Validate
    validateDepartment();
}

// Load departments from database
async function loadDepartments() {
    const optionsList = document.getElementById('optionsList');
    optionsList.innerHTML = '<div class="loading-options"><i class="fa-solid fa-spinner fa-spin"></i> Loading departments...</div>';
    
    try {
        const departments = await fetchDepartmentsFromDB();
        
        optionsList.innerHTML = '';
        departments.forEach(dept => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.setAttribute('data-value', dept.id);
            option.textContent = dept.name;
            option.onclick = () => selectOption(dept.id, dept.name);
            optionsList.appendChild(option);
        });
        
    } catch (error) {
        optionsList.innerHTML = '<div class="loading-options">Failed to load departments</div>';
    }
}

// Simulate database fetch (Replace with actual API call)
async function fetchDepartmentsFromDB() {
    try {
        const res = await fetch("https://attendance-tracker-tvx5.onrender.com/departments");
        const data = await res.json();

        return data;  // 🔥 real DB data

    } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
    }
}
// Generate secure password
function generateSecurePassword() {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%&*';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < 8; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
}


// Validation functions
function validateName() {
    const name = document.getElementById('fullName').value.trim();
    const group = document.getElementById('fullName').parentElement;
    
    if (!name || name.length < 3) {
        group.classList.add('error');
        group.classList.remove('success');
        return false;
    }
    group.classList.remove('error');
    group.classList.add('success');
    return true;
}

function validateEmail() {
    const email = document.getElementById('email').value.trim();
    const group = document.getElementById('email').parentElement;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !regex.test(email)) {
        group.classList.add('error');
        group.classList.remove('success');
        return false;
    }
    group.classList.remove('error');
    group.classList.add('success');
    return true;
}

function validatePhone() {
    const phone = document.getElementById('phone').value.trim();
    const group = document.getElementById('phone').parentElement;
    
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        group.classList.add('error');
        group.classList.remove('success');
        return false;
    }
    group.classList.remove('error');
    group.classList.add('success');
    return true;
}

function validateDepartment() {
    const dept = document.getElementById('department').value;
    const group = document.querySelector('.department-group');
    
    if (!dept) {
        group.classList.add('error');
        group.classList.remove('success');
        return false;
    }
    group.classList.remove('error');
    group.classList.add('success');
    return true;
}

// Register teacher
async function registerTeacher(event) {
    event.preventDefault();
    
    if (!validateName() || !validateEmail() || !validatePhone() || !validateDepartment()) {
        showToast('Please fill all fields correctly', 'error');
        return false;
    }
    
    const teacherData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        departmentId: document.getElementById('department').value,
        departmentName: document.querySelector('.select-value').textContent
    };
    

    
    
    showLoading();
    
try {
    // 🔥 CALL BACKEND API
    const response = await fetch("https://attendance-tracker-tvx5.onrender.com/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", "secret":"admin@122"
        },
        body: JSON.stringify({
            name: teacherData.fullName,
            email: teacherData.email,
            mobile: teacherData.phone,
            department_id: teacherData.departmentId
            
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.detail || "Registration failed");
    }

    // ✅ SUCCESS FLOW

    

    hideLoading();

    showSuccessModal(teacherData);

    // Reset form
    document.getElementById('teacherRegisterForm').reset();
    document.querySelector('.select-value').textContent = 'Select Department';
    document.getElementById('department').value = '';

    document.querySelectorAll('.form-group').forEach(g => {
        g.classList.remove('success', 'error');
    });

    showToast('Teacher registered successfully!', 'success');

} catch (error) {
    hideLoading();
    showToast(error.message, 'error');
}return false;
}

// Save teacher to localStorage
function saveTeacherToLocalStorage(teacher) {
    let teachers = localStorage.getItem('teachers');
    teachers = teachers ? JSON.parse(teachers) : [];
    
    const newTeacher = {
        id: teachers.length + 1,
        name: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        department: teacher.departmentName,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    teachers.push(newTeacher);
    localStorage.setItem('teachers', JSON.stringify(teachers));
}

// Show success modal
function showSuccessModal(teacherData) {
    document.getElementById('displayName').textContent = teacherData.fullName;
    document.getElementById('displayEmail').textContent = teacherData.email;
    document.getElementById('displayPhone').textContent = teacherData.phone;
    document.getElementById('displayDept').textContent = teacherData.departmentName;
    document.getElementById('successModal').classList.add('show');
}

// Close modal
function closeModal() {
    document.getElementById('successModal').classList.remove('show');
}

// Show toast
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Show loading
function showLoading() {
    document.getElementById('registerBtn').classList.add('loading');
    document.getElementById('registerBtn').disabled = true;
    document.getElementById('loadingOverlay').classList.add('show');
}

// Hide loading
function hideLoading() {
    document.getElementById('registerBtn').classList.remove('loading');
    document.getElementById('registerBtn').disabled = false;
    document.getElementById('loadingOverlay').classList.remove('show');
}