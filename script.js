const API = "http://127.0.0.1:5000";

// ---------- LOGIN ----------
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(API + "/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    })
    .then(res => res.json())
    .then(data => {
        if(data.token) {
            localStorage.setItem("token", data.token);
            if(data.role === "student") location.href = "student.html";
            else if(data.role === "faculty") location.href = "faculty.html";
        } else {
            document.getElementById("error").innerText = data.msg || "Login failed!";
        }
    })
    .catch(err => document.getElementById("error").innerText = "Server error!");
}

// ---------- STUDENT DASHBOARD ----------
function loadStudent() {
    const token = localStorage.getItem("token");
    if(!token) { location.href="login.html"; return; }

    fetch(API + "/student/records", {
        headers: {Authorization: "Bearer " + token}
    })
    .then(res => res.json())
    .then(data => {
        if(data.msg) {
            alert(data.msg);
            return;
        }

        // ---------- SEMESTER TABLE ----------
        const tbody = document.querySelector("#recordsTable tbody");
        tbody.innerHTML = "";
        data.records.forEach(r => {
            const row = `<tr>
                <td>${r.semester}</td>
                <td>${r.subject}</td>
                <td>${r.marks}</td>
                <td>${r.attendance}%</td>
            </tr>`;
            tbody.innerHTML += row;
        });

        // ---------- MARKS CHART ----------
        const ctx = document.getElementById("marksChart").getContext('2d');
        const subjects = data.records.map(r => r.subject);
        const marks = data.records.map(r => r.marks);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Marks',
                    data: marks,
                    backgroundColor: 'rgba(0,123,255,0.7)'
                }]
            },
            options: {
                responsive:true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });

        // ---------- ATTENDANCE CIRCLE ----------
        const avgAttendance = Math.round(data.records.reduce((a,b)=>a+b.attendance,0)/data.records.length);
        document.getElementById("attendancePercent").innerText = avgAttendance + "%";
        const maskHalf = document.getElementById("maskHalf");
        maskHalf.style.transform = `rotate(${avgAttendance*1.8}deg)`;
    })
    .catch(err => console.log(err));
}

// ---------- FACULTY DASHBOARD ----------
function loadFaculty() {
    const token = localStorage.getItem("token");
    if(!token) { location.href="login.html"; return; }

    fetch(API + "/faculty/view", {headers:{Authorization:"Bearer "+token}})
    .then(res=>res.json())
    .then(data=>{
        const tbody = document.querySelector("#facultyTable tbody");
        tbody.innerHTML="";
        data.records.forEach(r=>{
            const row = `<tr>
                <td>${r.student}</td>
                <td>${r.semester}</td>
                <td>${r.subject}</td>
                <td>${r.marks}</td>
                <td>${r.attendance}%</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    })
    .catch(err=>console.log(err));
}

// ---------- LOGOUT ----------
function logout() {
    localStorage.removeItem("token");
    location.href="login.html";
}
