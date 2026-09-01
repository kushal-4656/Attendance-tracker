document.addEventListener("DOMContentLoaded", () => {
  loadTeachers();
  loadDepartments();
});

let teachers = [];
let filteredTeachers = [];
let currentPage = 1;
let rowsPerPage = 10;
let currentDeleteId = null;
let currentEditId = null;

async function loadTeachers() {
  try {
    const res = await fetch(
      "https://attendance-tracker-tvx5.onrender.com/faculty",
      {
        method: "GET",
        headers: {
          secret: "admin@122",
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();

    teachers = data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.mobile,
      department: user.department,
      status: "Active",
      joinDate: new Date().toLocaleDateString(),
    }));

    updateStats();
    filterAndDisplay();
  } catch (error) {
    console.error("Error loading teachers:", error);
    showToast("Failed to load teachers", "error");
  }
}

async function loadDepartments() {
  try {
    const res = await fetch(
      "https://attendance-tracker-tvx5.onrender.com/departments",
    );
    const data = await res.json();

    const filter = document.getElementById("filterDept");
    filter.innerHTML = '<option value="">All Departments</option>';

    data.forEach((dept) => {
      filter.innerHTML += `<option value="${dept.name}">${dept.name}</option>`;
    });
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}

function updateStats() {
  document.getElementById("totalTeachers").textContent = teachers.length;
  const uniqueDepts = [...new Set(teachers.map((t) => t.department))];
  document.getElementById("totalDepts").textContent = uniqueDepts.length;
  const activeCount = teachers.filter((t) => t.status === "Active").length;
  document.getElementById("activeTeachers").textContent = activeCount;
}

function filterAndDisplay() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filterDept = document.getElementById("filterDept").value;

  filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm) ||
      teacher.email.toLowerCase().includes(searchTerm) ||
      teacher.department.toLowerCase().includes(searchTerm);
    const matchesDept = !filterDept || teacher.department === filterDept;
    return matchesSearch && matchesDept;
  });

  currentPage = 1;
  displayTeachers();
}

function displayTeachers() {
  const tbody = document.getElementById("teachersTableBody");
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageTeachers = filteredTeachers.slice(start, end);

  if (pageTeachers.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="loading-row">No teachers found</td></tr>';
    document.getElementById("pageInfo").textContent = `Page 0 of 0`;
    document.getElementById("prevBtn").disabled = true;
    document.getElementById("nextBtn").disabled = true;
    return;
  }

  tbody.innerHTML = pageTeachers
    .map(
      (teacher) => `
        <tr>
            <td><input type="checkbox" class="teacher-checkbox" value="${teacher.id}"></td>
            <td>TCH${teacher.id.toString().padStart(3, "0")}</td>
            <td>${teacher.name}</td>
            <td>${teacher.email}</td>
            <td>${teacher.phone}</td>
            <td>${teacher.department}</td>
            <td><span class="status-badge status-${teacher.status.toLowerCase().replace(" ", "")}">${teacher.status}</span></td>
            <td>${teacher.joinDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewTeacher(${teacher.id})"><i class="fa-solid fa-eye"></i></button>
                    <button class="edit-btn" onclick="editTeacher(${teacher.id})"><i class="fa-solid fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteTeacher(${teacher.id}, '${teacher.name}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");

  const totalPages = Math.ceil(filteredTeachers.length / rowsPerPage);
  document.getElementById("pageInfo").textContent =
    `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

function changePage(direction) {
  const totalPages = Math.ceil(filteredTeachers.length / rowsPerPage);
  if (direction === "prev" && currentPage > 1) {
    currentPage--;
  } else if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  }
  displayTeachers();
}

function viewTeacher(id) {
  const teacher = teachers.find((t) => t.id === id);
  if (teacher) {
    document.getElementById("viewName").textContent = teacher.name;
    document.getElementById("viewId").textContent =
      `TCH${teacher.id.toString().padStart(3, "0")}`;
    document.getElementById("viewEmail").textContent = teacher.email;
    document.getElementById("viewPhone").textContent = teacher.phone;
    document.getElementById("viewDept").textContent = teacher.department;
    document.getElementById("viewStatus").innerHTML =
      `<span class="status-badge status-${teacher.status.toLowerCase().replace(" ", "")}">${teacher.status}</span>`;
    document.getElementById("viewJoinDate").textContent = teacher.joinDate;
    document.getElementById("viewModal").classList.add("show");
  }
}

function editTeacher(id) {
  const teacher = teachers.find((t) => t.id === id);
  if (teacher) {
    currentEditId = id;
    document.getElementById("editName").value = teacher.name;
    document.getElementById("editEmail").value = teacher.email;
    document.getElementById("editPhone").value = teacher.phone;
    document.getElementById("editDept").value = teacher.department;
    document.getElementById("editStatus").value = teacher.status;
    document.getElementById("editModal").classList.add("show");
  }
}

async function saveTeacherEdit(event) {
  event.preventDefault();

  const updatedData = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    mobile: document.getElementById("editPhone").value,
    department: document.getElementById("editDept").value,
    status: document.getElementById("editStatus").value,
  };

  try {
    const res = await fetch(
      `https://attendance-tracker-tvx5.onrender.com/faculty/${currentEditId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      },
    );

    if (!res.ok) throw new Error();

    showToast("Teacher updated successfully!", "success");
    loadTeachers();
    closeEditModal();
  } catch {
    showToast("Update failed", "error");
  }
}

function deleteTeacher(id, name) {
  currentDeleteId = id;
  document.getElementById("deleteTeacherName").textContent = name;
  document.getElementById("deleteModal").classList.add("show");
}

async function confirmDelete() {
  try {
    const res = await fetch(
      `https://attendance-tracker-tvx5.onrender.com/faculty/${currentDeleteId}`,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) throw new Error();

    showToast("Teacher deleted successfully!", "success");
    loadTeachers();
    closeDeleteModal();
  } catch {
    showToast("Error deleting teacher", "error");
  }
}

function exportData() {
  if (filteredTeachers.length === 0) {
    showToast("No data to export", "error");
    return;
  }

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Department",
    "Status",
    "Join Date",
  ];
  const rows = filteredTeachers.map((teacher) => [
    `TCH${teacher.id.toString().padStart(3, "0")}`,
    teacher.name,
    teacher.email,
    teacher.phone,
    teacher.department,
    teacher.status,
    teacher.joinDate,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `teachers_export_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Data exported successfully!", "success");
}

function refreshTable() {
  loadTeachers();
  document.getElementById("searchInput").value = "";
  document.getElementById("filterDept").value = "";
  showToast("Table refreshed!", "success");
}

function toggleSelectAll() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".teacher-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAll.checked;
  });
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
  currentEditId = null;
}

function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("show");
  currentDeleteId = null;
}

function closeViewModal() {
  document.getElementById("viewModal").classList.remove("show");
}

function editFromView() {
  closeViewModal();
  if (currentEditId) {
    editTeacher(currentEditId);
  }
}

function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

document
  .getElementById("searchInput")
  .addEventListener("input", filterAndDisplay);
document
  .getElementById("filterDept")
  .addEventListener("change", filterAndDisplay);
