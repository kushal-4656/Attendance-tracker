// AUTH CHECK
(function checkAuth(){
const faculty_id = localStorage.getItem('faculty_id');

if(!faculty_id){
alert("Please login first");
window.location.replace("index.html");
}
})();


// DOM LOADED
document.addEventListener("DOMContentLoaded",function(){

const userName = localStorage.getItem("faculty_name") || "Faculty";
document.getElementById("userName").textContent = userName;

updateDateTime();
setInterval(updateDateTime,1000);

loadDashboardStats();
loadRecentActivity();

});


// LIVE TIME
function updateDateTime(){

const now = new Date();

const options = {
weekday:"long",
year:"numeric",
month:"long",
day:"numeric",
hour:"2-digit",
minute:"2-digit",
second:"2-digit",
hour12:true
};

document.getElementById("dateTime")
.textContent = now.toLocaleDateString("en-US",options);

}


// DASHBOARD STATS
function loadDashboardStats(){

const records =
JSON.parse(localStorage.getItem("attendance_records") || "[]");

const today = new Date().toLocaleDateString();

const todayRecords =
records.filter(r=>r.date===today);

const todayPresent =
todayRecords.reduce((sum,r)=>sum+r.present,0);

document.getElementById("todayCount").textContent = todayPresent;


const totalStudents =
records.reduce((sum,r)=>sum+r.total,0);

document.getElementById("totalStudents").textContent = totalStudents;


const totalPresent =
records.reduce((sum,r)=>sum+r.present,0);

const avgAttendance =
totalStudents>0 ?
((totalPresent/totalStudents)*100).toFixed(1) : 0;

document.getElementById("avgAttendance")
.textContent = avgAttendance+"%";


const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate()-7);

const weekRecords =
records.filter(r => new Date(r.date)>=oneWeekAgo);

const weekPresent =
weekRecords.reduce((sum,r)=>sum+r.present,0);

document.getElementById("weekCount").textContent = weekPresent;

}


// RECENT ACTIVITY
function loadRecentActivity(){

const records =
JSON.parse(localStorage.getItem("attendance_records") || "[]");

const activityList =
document.getElementById("recentActivity");

if(records.length===0){

activityList.innerHTML =
"<p>No attendance records yet</p>";

return;

}

const recent =
records.slice(-5).reverse();

let html = "";

recent.forEach(record=>{

html += `
<div class="activity-item"
onclick="window.location.href='view_attendance.html'">

<div class="activity-icon">
<i class="fas fa-calendar-check"></i>
</div>

<div class="activity-details">
<div class="activity-title">
${record.department} - ${record.className}
</div>

<div class="activity-meta">
<span>${record.date}</span>
<span>${record.time}</span>
<span>${record.present}/${record.total}</span>
</div>

</div>

</div>
`;

});

activityList.innerHTML = html;

}


// LOGOUT
function logout(){

showLoading();

setTimeout(()=>{
localStorage.clear();
showToast("Logged out successfully");
window.location.replace("index.html");
},1000);

}


// TOAST
function showToast(message,type="success"){

const toast = document.getElementById("toast");

toast.textContent = message;

toast.className = "toast "+type;

toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},3000);

}


// LOADING
function showLoading(){
document.getElementById("loadingOverlay")
.classList.add("show");
}

function hideLoading(){
document.getElementById("loadingOverlay")
.classList.remove("show");
}