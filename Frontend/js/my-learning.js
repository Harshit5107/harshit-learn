// my-learning.js
const API_BASE = "https://harshit-learn.onrender.com/api";

const token = localStorage.getItem("token");

function parseJwtId(tok) {
  try {
    const payload = tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(payload).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const obj = JSON.parse(json);
    return obj.id || obj._id || null;
  } catch {
    return null;
  }
}

const userId = parseJwtId(token);

if (!userId) {
  localStorage.clear();
  window.location.href = "frontend.html";
}

async function fetchMyCourses() {
  // Prefer a dedicated endpoint if backend provides it
  const endpoints = [
    `${API_BASE}/courses/my`,
    `${API_BASE}/courses` // fallback: fetch all and filter
  ];

  let courses = [];
  for (let ep of endpoints) {
    try {
      const res = await fetch(ep, { headers: { Authorization: "Bearer " + token }});
      if (!res.ok) {
        // if /courses/my doesn't exist it may 404, continue to fallback
        continue;
      }
      const data = await res.json();
      // try to normalize: data.courses or data or array
      courses = data.courses || data.coursesList || data || [];
      break;
    } catch (err) {
      console.warn("Fetch error for", ep, err);
      continue;
    }
  }

  // ensure array
  if (!Array.isArray(courses)) courses = [];

  // if fallback returned all courses, filter by enrollment
  courses = courses.filter(c => {
    const enrolled = Array.isArray(c.enrolledStudents) ? c.enrolledStudents : (c.enrolledStudents || []);
    const enrolledIds = enrolled.map(id => id && id.toString ? id.toString() : id);
    return enrolledIds.includes(userId);
  });

  return courses;
}

function renderCourses(courses) {
  const root = document.getElementById("myCourses");
  const empty = document.getElementById("emptyState");
  root.innerHTML = "";

  if (!courses || courses.length === 0) {
    empty.style.display = "block";
    return;
  } else {
    empty.style.display = "none";
  }

  courses.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-card";

    // compute student progress (from course.progress array) or fallback zero
    let progress = 0;
    if (Array.isArray(course.progress)) {
      const p = course.progress.find(pr => {
        const sid = pr && pr.student && pr.student.toString ? pr.student.toString() : (pr && pr.student);
        return sid === userId;
      });
      progress = p && typeof p.value === "number" ? p.value : 0;
    } else if (typeof course.progress === "number") {
      progress = course.progress;
    }

    card.innerHTML = `
      ${progress >= 100 ? `<div class="badge-completed">✓ Completed</div>` : ""}
      <h3>${escapeHtml(course.title || "Untitled Course")}</h3>
      <p style="color:#94A3B8;margin-top:6px;">${escapeHtml((course.description || "").slice(0, 140))}</p>

      <div class="progress-bar" aria-hidden="true">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>

      <div style="display:flex; gap:12px; align-items:center; justify-content:space-between;">
        <div style="color:#94A3B8; font-weight:700;">${progress}%</div>
        <div>
          <button class="btn btn-primary" onclick="openCourse('${course._id || course.id}')">
            ${progress >= 100 ? "View" : "Continue"}
          </button>
        </div>
      </div>
    `;

    root.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"'`=\/]/g, function (s) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' })[s];
  });
}

function openCourse(id) {
  if (!id) return;
  window.location.href = `course.html?id=${id}`;
}

// initial load
(async function init() {
  try {
    const courses = await fetchMyCourses();
    renderCourses(courses);
  } catch (err) {
    console.error("Could not load courses:", err);
    document.getElementById("emptyState").innerText = "Error loading courses. Check console.";
    document.getElementById("emptyState").style.display = "block";
  }
})();
