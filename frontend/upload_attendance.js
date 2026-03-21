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

const dept=document.getElementById("department").value;
const class_name=document.getElementById("class_name").value;

document.getElementById("summaryDept").textContent = dept || "Not selected";
document.getElementById("summaryClass").textContent = class_name || "Not entered";

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

const dept=document.getElementById("department").value;
const class_name=document.getElementById("class_name").value;

const total=parseInt(document.getElementById("total_strengthStrength").value)||0;
const present=parseInt(document.getElementById("present_countCount").value)||0;

if(!dept){
showToast("Select department","error");
return;
}

if(!class_name){
showToast("Enter class name","error");
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
department:dept,
class_name:class_name,
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