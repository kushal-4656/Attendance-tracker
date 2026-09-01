// AUTH CHECK
(function checkAuth() {
  const faculty_id = localStorage.getItem("faculty_id");
  if (!faculty_id) {
    alert("Please login first");
    window.location.replace("index.html");
  }
})();
document.addEventListener("DOMContentLoaded", function () {
  const userName = localStorage.getItem("faculty_name") || "Faculty";
  document.getElementById("userName").textContent = userName;

  updateProfileInfo();

  updateDateTime();
  setInterval(updateDateTime, 1000);
  loadDashboardStats();

  document.addEventListener("click", function (event) {
    const profileContainer = document.querySelector(".profile-container");
    const dropdown = document.getElementById("profileDropdown");
    if (profileContainer && !profileContainer.contains(event.target)) {
      dropdown.classList.remove("show");
    }
  });
});

function updateProfileInfo() {
  const facultyName = localStorage.getItem("faculty_name") || "Faculty";
  const facultyEmail = localStorage.getItem("faculty_email") || "email";
  const facultyPhone = localStorage.getItem("faculty_phone") || "mobile";

  document.getElementById("profileName").textContent = facultyName;
  document.getElementById("profileEmail").textContent = facultyEmail;
  document.getElementById("profilePhone").textContent = facultyPhone;
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("show");
}

function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  document.getElementById("dateTime").textContent = now.toLocaleDateString(
    "en-US",
    options,
  );
}

async function loadDashboardStats() {
  const faculty_id = localStorage.getItem("faculty_id");

  try {
    const res = await fetch(
      `https://attendance-tracker-tvx5.onrender.com/dashboard/${faculty_id}`,
    );

    const data = await res.json();

    document.getElementById("todayCount").textContent = data.today_count;
    document.getElementById("totalStudents").textContent = data.total_students;
    document.getElementById("avgAttendance").textContent =
      data.avg_attendance + "%";
    document.getElementById("weekCount").textContent = data.week_count;

    // Render Recent Activity list
    const recentActivityContainer = document.getElementById("recentActivity");
    if (recentActivityContainer && data.recent_activity) {
      if (data.recent_activity.length === 0) {
        recentActivityContainer.innerHTML = `<p class="no-activity" style="color: #666; font-style: italic; padding: 10px;">No recent attendance uploads found.</p>`;
      } else {
        recentActivityContainer.innerHTML = data.recent_activity
          .map(
            (item) => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="activity-details">
                            <div class="activity-title">Attendance marked for Class ID: ${item.class_id}</div>
                            <div class="activity-meta">
                                <span><i class="far fa-calendar-alt"></i> ${item.date}</span>
                                <span><i class="fas fa-users"></i> Present: ${item.present}/${item.total}</span>
                            </div>
                        </div>
                    </div>
                `,
          )
          .join("");
      }
    }
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}
function openChangePasswordModal() {
  document.getElementById("passwordModal").classList.add("show");
}

function closePasswordModal() {
  document.getElementById("passwordModal").classList.remove("show");
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
}

async function changePassword() {
  const currentPwd = document.getElementById("currentPassword").value;
  const newPwd = document.getElementById("newPassword").value;
  const confirmPwd = document.getElementById("confirmPassword").value;

  const faculty_id = localStorage.getItem("faculty_id");

  if (!currentPwd || !newPwd || !confirmPwd) {
    showToast("Please fill all fields", "error");
    return;
  }

  if (newPwd.length < 8) {
    showToast("Password must be at least 8 characters", "error");
    return;
  }

  if (newPwd !== confirmPwd) {
    showToast("Passwords do not match", "error");
    return;
  }

  try {
    const res = await fetch(
      `https://attendance-tracker-tvx5.onrender.com/change-password?faculty_id=${faculty_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: currentPwd,
          new_password: newPwd,
          confirm_password: confirmPwd,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Change failed");
    }

    showToast("Password changed successfully!", "success");
    closePasswordModal();
  } catch (error) {
    showToast(error.message, "error");
  }
}
function logout() {
  showLoading();
  setTimeout(() => {
    localStorage.removeItem("faculty_name");
    localStorage.removeItem("faculty_email");
    localStorage.removeItem("faculty_phone");
    localStorage.removeItem("faculty_id");
    showToast("Logged out successfully");
    setTimeout(() => {
      window.location.replace("index.html");
    }, 500);
  }, 500);
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast " + type;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function showLoading() {
  document.getElementById("loadingOverlay").classList.add("show");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.remove("show");
}
