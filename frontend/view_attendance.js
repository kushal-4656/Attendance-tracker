// ========== LIVE DATE AND TIME ==========
function updateDateTime() {
    const now = new Date();

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    document.getElementById('liveDate').textContent =
        now.toLocaleDateString('en-US', dateOptions);
}

// Update every second
setInterval(updateDateTime, 1000);
updateDateTime();


// ========== INITIALIZE DATE PICKERS ==========
flatpickr(".datepicker", {
    dateFormat: "Y-m-d",
    allowInput: true,
    maxDate: "today"
});


// ========== GLOBAL DATA ==========
let attendanceData = [];


// ========== LOAD ATTENDANCE DATA ==========
async function loadAttendanceData() {

    const faculty_id = localStorage.getItem("faculty_id");

    if (!faculty_id) {
        showToast("Faculty not logged in", "error");
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/attendence?faculty_id=${faculty_id}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch attendance");
        }

        const data = await response.json();

        attendanceData = data.map(record => {

            const total = record.total_strength;
            const present = record.present_count;
            const absent = record.total_strength - record.present_count;

            const percentage = ((present / total) * 100).toFixed(1);

            return {
                date: record.date,
                time: "N/A",
                department: record.department,
                class_name: record.class_name,
                total: total,
                present: present,
                absent: absent,
                percentage: percentage
            };

        });

        updateTotalRecords();
        displayAttendance(attendanceData);

    } catch (error) {

        console.error(error);
        showToast("Failed to load attendance", "error");

    }
}


// ========== DISPLAY ATTENDANCE ==========
function displayAttendance(data) {

    const tbody = document.getElementById('tableBody');
    const displayCount = document.getElementById('displayCount');

    if (data.length === 0) {

        tbody.innerHTML = `
        <tr>
            <td colspan="10" class="no-data">
                <i class="fas fa-folder-open"></i>
                <p>No attendance records found</p>
                <p style="font-size:0.9em;color:#999;">
                Try adjusting your filters
                </p>
            </td>
        </tr>
        `;

        displayCount.textContent = "Showing 0 records";
        return;
    }

    let html = "";

    data.forEach((record, index) => {

        const percentage = parseFloat(record.percentage);

        let statusClass = "percentage-medium";
        let statusText = "Average";

        if (percentage >= 75) {
            statusClass = "percentage-high";
            statusText = "Good";
        }
        else if (percentage >= 60) {
            statusClass = "percentage-medium";
            statusText = "Average";
        }
        else {
            statusClass = "percentage-low";
            statusText = "Low";
        }

        html += `
        <tr onclick="viewRecordDetails(${index})">
            <td>${index + 1}</td>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td>${record.department}</td>
            <td>${record.class_name}</td>
            <td>${record.total}</td>
            <td>${record.present}</td>
            <td>${record.absent}</td>
            <td>${record.percentage}%</td>
            <td>
                <span class="percentage-badge ${statusClass}">
                ${statusText}
                </span>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html;
    displayCount.textContent = `Showing ${data.length} records`;

    updateSummaryStats(data);
}


// ========== SUMMARY STATS ==========
function updateSummaryStats(data) {

    const totalRecords = data.length;

    const totalStudents =
        data.reduce((sum, record) => sum + record.total, 0);

    const totalPresent =
        data.reduce((sum, record) => sum + record.present, 0);

    const avgAttendance =
        totalStudents > 0
            ? ((totalPresent / totalStudents) * 100).toFixed(1)
            : 0;

    document.getElementById('total_strengthRecordsCount')
        .textContent = totalRecords;

    document.getElementById('total_strengthStudentsSum')
        .textContent = totalStudents;

    document.getElementById('total_strengthPresentSum')
        .textContent = totalPresent;

    document.getElementById('averageAttendance')
        .textContent = avgAttendance + "%";
}


// ========== TOTAL RECORDS ==========
function updateTotalRecords() {

    document.getElementById("total_strengthRecords")
        .textContent = `${attendanceData.length} Total Records`;
}


// ========== APPLY FILTERS ==========
function applyFilters() {

    const fromDate =
        document.getElementById("fromDate").value;

    const toDate =
        document.getElementById("toDate").value;

    const department =
        document.getElementById("filterDepartment").value;

    let filteredData = [...attendanceData];

    if (fromDate) {
        filteredData = filteredData.filter(record =>
            new Date(record.date) >= new Date(fromDate)
        );
    }

    if (toDate) {
        filteredData = filteredData.filter(record =>
            new Date(record.date) <= new Date(toDate)
        );
    }

    if (department !== "all") {
        filteredData = filteredData.filter(record =>
            record.department === department
        );
    }

    displayAttendance(filteredData);

    showToast(`Showing ${filteredData.length} records`, "success");
}


// ========== RESET FILTERS ==========
function resetFilters() {

    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    document.getElementById("filterDepartment").value = "all";

    displayAttendance(attendanceData);

    showToast("Filters reset", "success");
}


// ========== VIEW RECORD ==========
function viewRecordDetails(index) {

    const record = attendanceData[index];

    alert(`
Attendance Details
Date: ${record.date}
Department: ${record.department}
Class: ${record.class_name}

Total: ${record.total}
Present: ${record.present}
Absent: ${record.absent}

Percentage: ${record.percentage}%
`);
}


// ========== EXPORT CSV ==========
function exportToCSV() {

    if (attendanceData.length === 0) {
        showToast("No data to export", "error");
        return;
    }

    const headers =
        ["Date","Time","Department","Class","Total","Present","Absent","Percentage"];

    const rows = attendanceData.map(record => [
        record.date,
        record.time,
        record.department,
        record.class_name,
        record.total,
        record.present,
        record.absent,
        record.percentage + "%"
    ]);

    const csvContent =
        [headers, ...rows].map(e => e.join(",")).join("\n");

    const blob =
        new Blob([csvContent], { type: "text/csv" });

    const url =
        window.URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;
    a.download =
        `attendance_${new Date().toISOString().split("T")[0]}.csv`;

    a.click();

    showToast("CSV Exported", "success");
}


// ========== TOAST ==========
function showToast(message, type = "success") {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.className =
        "toast " + type;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// ========== INITIAL LOAD ==========
loadAttendanceData();

console.log("View Attendance page loaded successfully");