document.addEventListener("DOMContentLoaded", async () => {
    updateDateTime();

    await loadDepartments();        // 1️⃣ first load options
    await autoSelectDepartment();   // 2️⃣ then select
await loadClasses();          // 🔥 new
});
// LIVE DATE TIME
function updateDateTime(){

const now = new Date();

const dateOptions={
weekday:"long",
year:"numeric",
month:"long",
day:"numeric"
};

const timeOptions={
hour:"2-digit",
minute:"2-digit",
second:"2-digit",
hour12:true
};

document.getElementById("liveDate")
.textContent = now.toLocaleDateString("en-US",dateOptions);

document.getElementById("liveTime")
.textContent = now.toLocaleTimeString("en-US",timeOptions);

}

setInterval(updateDateTime,1000);
updateDateTime();


// VALIDATION
function validateTotalStrength(){

const total=parseInt(document.getElementById("total_strengthStrength").value)||0;
const present=parseInt(document.getElementById("present_countCount").value)||0;

if(present>total){
document.getElementById("present_countCount").value=total;
}

calculateAttendance();

}

function validatePresentCount(){

const total=parseInt(document.getElementById("total_strengthStrength").value)||0;
let present=parseInt(document.getElementById("present_countCount").value)||0;

if(present>total){
present=total;
document.getElementById("present_countCount").value=present;
}

calculateAttendance();

}


// CALCULATE
function calculateAttendance(){

const total=parseInt(document.getElementById("total_strengthStrength").value)||0;
const present=parseInt(document.getElementById("present_countCount").value)||0;

const absent = total-present;
const percent = total>0 ? ((present/total)*100).toFixed(1):0;

document.getElementById("summaryTotal").textContent=total;
document.getElementById("summaryPresent").textContent=present;
document.getElementById("summaryAbsent").textContent=absent;
document.getElementById("summaryPercentage").textContent=percent+"%";

}


// UPDATE SUMMARY
function updateSummary(){

    // department is now text (not dropdown)
    const deptDropdown = document.getElementById("department");
const dept = deptDropdown.options[deptDropdown.selectedIndex]?.text;
    // get selected class name (not id)fa
    const classDropdown = document.getElementById("class_name");
    const class_name = classDropdown.options[classDropdown.selectedIndex]?.text;

    document.getElementById("summaryDept").textContent = dept || "Not selected";
    document.getElementById("summaryClass").textContent = class_name || "Not selected";

    calculateAttendance();
}


// RESET
function resetForm(){

if(confirm("Reset form?")){

document.getElementById("department").value="";
document.getElementById("class_name").value="";
document.getElementById("total_strengthStrength").value=0;
document.getElementById("present_countCount").value=0;

calculateAttendance();

showToast("Form reset");

}

}


// SUBMIT
async function submitAttendance(){

const class_id=document.getElementById("class_name").value;

const total=parseInt(document.getElementById("total_strengthStrength").value)||0;
const present=parseInt(document.getElementById("present_countCount").value)||0;

if(!class_id){
showToast("Select class","error");
return;
}

const faculty_id = localStorage.getItem("faculty_id");

const date = new Date().toISOString().split("T")[0];

try{

const response = await fetch(
`https://attendance-tracker-tvx5.onrender.com/attendence?faculty_id=${faculty_id}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
class_id: class_id,          // 🔥 changed
total_strength:total,
present_count:present,
date:date
})
});

if(!response.ok){
throw new Error("Save failed");
}

showToast("Attendance saved");

}catch(error){

showToast("Error saving attendance","error");

}

}
// TOAST
function showToast(message,type="success"){

const toast=document.getElementById("toast");

toast.textContent=message;
toast.className="toast "+type;

toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},3000);

}
async function autoSelectDepartment() {
    const faculty_id = localStorage.getItem("faculty_id");

    try {
        const res = await fetch(`https://attendance-tracker-tvx5.onrender.com/faculty/${faculty_id}`);
        const data = await res.json();

        const dropdown = document.getElementById("department");

        dropdown.value = data.department_id;   // 🔥 key line

        // optional (recommended)
        dropdown.disabled = true;

    } catch (error) {
        console.error("Error fetching faculty:", error);
    }
}

async function loadDepartments() {
    const res = await fetch("https://attendance-tracker-tvx5.onrender.com/departments");
    const data = await res.json();

    const dropdown = document.getElementById("department");

    dropdown.innerHTML = '<option value="">Select Department</option>';

    data.forEach(dep => {
        const option = document.createElement("option");
        option.value = dep.id;     // 🔥 must be id
        option.text = dep.name;
        dropdown.appendChild(option);
    });
}
async function loadClasses() {

    const faculty_id = localStorage.getItem("faculty_id");

    try {
        const res = await fetch(`https://attendance-tracker-tvx5.onrender.com/classes/${faculty_id}`);
        const data = await res.json();

        const dropdown = document.getElementById("class_name");

        dropdown.innerHTML = '<option value="">Select Class</option>';

        data.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls.id;     // 🔥 important
            option.text = cls.name;    // 👀 visible
            dropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading classes:", error);
    }
}