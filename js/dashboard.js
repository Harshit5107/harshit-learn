const API_BASE = "https://harshit-learn.onrender.com/api";

const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "index.html";
}

async function loadMyCourses() {
  try {
    const res = await fetch(`${API}/users/my-courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const courses = await res.json();
    const container = document.getElementById("courses");
    container.innerHTML = "";

    if (courses.length === 0) {
      container.innerHTML = "<p>No enrolled courses yet.</p>";
      return;
    }

    courses.forEach((course) => {
      container.innerHTML += `
        <div class="course-card">
          <div class="course-title">${course.title}</div>
          <div class="course-desc">${course.description}</div>

          <div class="progress-bar">
            <div class="progress" style="width:${course.progress}%"></div>
          </div>

          <div class="progress-text">
            Progress: ${course.progress}% 
            ${course.completed ? "✅ Completed" : ""}
          </div>

          ${
            course.completed
              ? `<button class="btn completed">Completed</button>`
              : `<button class="btn" onclick="updateProgress('${course._id}')">
                   Continue Learning
                 </button>`
          }
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load courses");
  }
}

async function updateProgress(courseId) {
  const newProgress = prompt("Enter progress (0–100):");

  if (newProgress === null) return;

  await fetch(`${API}/courses/${courseId}/progress`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ progress: Number(newProgress) }),
  });

  loadMyCourses();
}

loadMyCourses();
