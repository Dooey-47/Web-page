/* main.js - shared frontend behavior for split pages
   This version does not depend on jQuery. It keeps the same public functions
   used by the HTML pages: calculateBMI, showWaterToast, closeToast,
   logWorkout, and deleteWorkout. */

(function () {
    "use strict";

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function trim(value) {
        return String(value || "").trim();
    }

    function safeGet(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            console.warn("Không đọc được localStorage:", error);
            return fallback;
        }
    }

    function safeSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error("Không lưu được localStorage:", error);
            return false;
        }
    }

    function getTodayInputValue() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const today = getTodayInputValue();
    let reminder = null;
    let seconds = 0;
    let workouts = loadWorkouts();

    window.calculateBMI = function () {
        const heightInput = $("#heightInput");
        const weightInput = $("#weightInput");

        if (!heightInput || !weightInput) {
            return false;
        }

        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);

        if (Number.isNaN(height) || Number.isNaN(weight)) {
            alert("Vui lòng nhập đủ dữ liệu");
            return false;
        }

        if (height <= 0 || weight <= 0) {
            alert("Dữ liệu phải lớn hơn 0");
            return false;
        }

        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        let category = "";
        let copy = "Hãy tiếp tục theo dõi định kỳ để hiểu xu hướng sức khỏe của bạn.";

        if (bmi < 18.5) {
            category = "Gầy";
            copy = "Bạn đang thấp hơn khoảng tham khảo phổ biến. Nên cân nhắc chế độ dinh dưỡng cân bằng.";
        } else if (bmi < 25) {
            category = "Bình thường";
            copy = "Chỉ số đang trong khoảng tham khảo phổ biến. Duy trì vận động và ăn uống điều độ nhé.";
        } else if (bmi < 30) {
            category = "Thừa cân";
            copy = "Bạn đang cao hơn khoảng tham khảo phổ biến. Có thể theo dõi thêm vận động và khẩu phần.";
        } else {
            category = "Béo phì";
            copy = "Chỉ số khá cao. Nên tham khảo chuyên gia nếu bạn muốn có kế hoạch phù hợp.";
        }

        safeSet("height", String(height));
        safeSet("weight", String(weight));

        const result = $("#bmiResult");
        if (result) {
            const score = $("#bmiScore");
            const categoryEl = $("#bmiCategory");
            const copyEl = $("#bmiCopy");

            if (score) score.textContent = bmi.toFixed(1);
            if (categoryEl) categoryEl.textContent = `Phân loại: ${category}`;
            if (copyEl) copyEl.textContent = copy;
            result.classList.add("is-visible");
        } else {
            alert(`BMI: ${bmi.toFixed(1)}\n\nPhân loại: ${category}`);
        }

        return false;
    };

    window.showWaterToast = function () {
        const waterToast = $("#waterToast");
        if (waterToast) {
            waterToast.style.display = "flex";
        }
    };

    window.closeToast = function () {
        const waterToast = $("#waterToast");
        if (waterToast) {
            waterToast.style.display = "none";
        }
    };

    window.logWorkout = function (event) {
        if (event) {
            event.preventDefault();
        }

        const workoutForm = $("#workoutForm");
        if (workoutForm) {
            return logWorkoutFromForm();
        }

        const exercise = prompt("Nhập bài tập:");
        if (!exercise || trim(exercise) === "") {
            return false;
        }

        workouts.unshift({
            id: Date.now(),
            name: trim(exercise),
            type: "Khác",
            duration: "",
            calories: "",
            date: today,
            note: ""
        });

        saveWorkouts();
        renderWorkout();
        return false;
    };

    window.deleteWorkout = function (index) {
        workouts.splice(index, 1);
        saveWorkouts();
        renderWorkout();
    };

    function init() {
        initBootstrapDropdownFallback();
        initSavedBmiInputs();
        initWaterReminder();
        initStopwatch();
        initWorkoutForm();
    }

    function initBootstrapDropdownFallback() {
        // Bootstrap handles dropdowns when available. This tiny fallback keeps links usable
        // in static/offline demos where Bootstrap JS might not initialize.
        $all(".dropdown-toggle").forEach(function (toggle) {
            toggle.addEventListener("click", function (event) {
                const menu = toggle.parentElement ? toggle.parentElement.querySelector(".dropdown-menu") : null;
                if (!menu || window.bootstrap) return;
                event.preventDefault();
                menu.style.display = menu.style.display === "block" ? "none" : "block";
            });
        });
    }

    function initSavedBmiInputs() {
        const heightInput = $("#heightInput");
        const weightInput = $("#weightInput");

        if (heightInput) {
            const savedHeight = safeGet("height", "");
            if (savedHeight) heightInput.value = savedHeight;
        }

        if (weightInput) {
            const savedWeight = safeGet("weight", "");
            if (savedWeight) weightInput.value = savedWeight;
        }
    }

    function initWaterReminder() {
        const reminderTime = $("#reminderTime");
        const waterToast = $("#waterToast");

        if (waterToast) {
            waterToast.style.display = "none";
        }

        if (!reminderTime) {
            return;
        }

        reminderTime.addEventListener("change", function () {
            clearInterval(reminder);
            const minute = parseInt(reminderTime.value, 10);

            if (!Number.isNaN(minute) && minute > 0 && waterToast) {
                reminder = setInterval(window.showWaterToast, minute * 60000);
            }
        });
    }

    function initStopwatch() {
        const stopwatch = $("#stopwatch");
        if (!stopwatch) {
            return;
        }

        setInterval(function () {
            seconds += 1;
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

            stopwatch.textContent = time;
            stopwatch.setAttribute("datetime", `PT${seconds}S`);
        }, 1000);
    }

    function initWorkoutForm() {
        const workoutForm = $("#workoutForm");
        const exerciseDate = $("#exerciseDate");

        if (exerciseDate && !exerciseDate.value) {
            exerciseDate.value = today;
        }

        if (workoutForm) {
            workoutForm.addEventListener("submit", window.logWorkout);
        }

        if (workoutForm || $(".btn-log")) {
            ensureWorkoutListContainer();
            renderWorkout();
        }
    }

    function logWorkoutFromForm() {
        const exerciseName = $("#exerciseName");
        const exerciseType = $("#exerciseType");
        const exerciseDuration = $("#exerciseDuration");
        const exerciseCalories = $("#exerciseCalories");
        const exerciseDate = $("#exerciseDate");
        const exerciseNote = $("#exerciseNote");

        if (!exerciseName || !exerciseDuration) {
            showWorkoutStatus("Không tìm thấy form tạo log. Hãy kiểm tra id của các input.", true);
            return false;
        }

        const name = trim(exerciseName.value);
        const type = exerciseType ? exerciseType.value || "Khác" : "Khác";
        const duration = parseInt(exerciseDuration.value, 10);
        const caloriesValue = exerciseCalories ? exerciseCalories.value : "";
        const calories = caloriesValue === "" ? "" : parseInt(caloriesValue, 10);
        const date = exerciseDate && exerciseDate.value ? exerciseDate.value : today;
        const note = exerciseNote ? trim(exerciseNote.value) : "";

        if (!name) {
            alert("Vui lòng nhập tên bài tập");
            exerciseName.focus();
            return false;
        }

        if (Number.isNaN(duration) || duration <= 0) {
            alert("Thời gian tập phải lớn hơn 0 phút");
            exerciseDuration.focus();
            return false;
        }

        if (calories !== "" && (Number.isNaN(calories) || calories < 0)) {
            alert("Calories không được nhỏ hơn 0");
            if (exerciseCalories) exerciseCalories.focus();
            return false;
        }

        workouts.unshift({
            id: Date.now(),
            name: name,
            type: type,
            duration: duration,
            calories: calories,
            date: date,
            note: note
        });

        if (!saveWorkouts()) {
            showWorkoutStatus("Không lưu được log. Hãy kiểm tra quyền localStorage/cookie của trình duyệt.", true);
            return false;
        }

        clearWorkoutForm();
        renderWorkout();
        showWorkoutStatus("Đã tạo log luyện tập mới.");
        return false;
    }

    function clearWorkoutForm() {
        const workoutForm = $("#workoutForm");
        const exerciseDate = $("#exerciseDate");
        const exerciseName = $("#exerciseName");

        if (!workoutForm) {
            return;
        }

        workoutForm.reset();
        if (exerciseDate) exerciseDate.value = today;
        if (exerciseName) exerciseName.focus();
    }

    function showWorkoutStatus(message, isError) {
        const status = $("#workoutStatus");

        if (!status) {
            alert(message);
            return;
        }

        status.textContent = message;
        status.classList.add("is-visible");
        status.style.color = isError ? "#c0392b" : "#12856a";

        setTimeout(function () {
            status.classList.remove("is-visible");
        }, 2500);
    }

    function normalizeWorkout(item) {
        if (typeof item === "string") {
            return {
                id: Date.now() + Math.random(),
                name: item,
                type: "Khác",
                duration: "",
                calories: "",
                date: "",
                note: ""
            };
        }

        item = item || {};

        return {
            id: item.id || Date.now() + Math.random(),
            name: item.name || "Bài tập chưa đặt tên",
            type: item.type || "Khác",
            duration: item.duration || "",
            calories: item.calories === 0 ? 0 : (item.calories || ""),
            date: item.date || "",
            note: item.note || ""
        };
    }

    function loadWorkouts() {
        try {
            const saved = JSON.parse(localStorage.getItem("workouts")) || [];
            return saved.map(normalizeWorkout);
        } catch (error) {
            console.warn("Không đọc được workout log:", error);
            return [];
        }
    }

    function saveWorkouts() {
        return safeSet("workouts", JSON.stringify(workouts));
    }

    function formatDate(value) {
        if (!value) {
            return "Chưa chọn ngày";
        }

        const parts = value.split("-");
        if (parts.length !== 3) {
            return value;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function ensureWorkoutListContainer() {
        if ($("#workoutList")) {
            return;
        }

        const workoutForm = $("#workoutForm");
        const list = document.createElement("div");
        list.id = "workoutList";
        list.className = "workout-list";
        list.setAttribute("aria-live", "polite");

        if (workoutForm && workoutForm.parentNode) {
            workoutForm.insertAdjacentElement("afterend", list);
        }
    }

    function renderWorkout() {
        ensureWorkoutListContainer();
        const list = $("#workoutList");

        if (!list) {
            return;
        }

        list.innerHTML = "";

        if (!workouts.length) {
            const empty = document.createElement("p");
            empty.className = "workout-empty";
            empty.textContent = "Chưa có log nào. Điền form bên trên rồi bấm TẠO LOG TẬP LUYỆN.";
            list.appendChild(empty);
            return;
        }

        workouts.forEach(function (item, index) {
            const workout = normalizeWorkout(item);
            workouts[index] = workout;

            const row = document.createElement("article");
            row.className = "workout-log-item";

            const top = document.createElement("div");
            top.className = "workout-log-top";

            const content = document.createElement("div");

            const title = document.createElement("h3");
            title.className = "workout-log-name";
            title.textContent = workout.name;

            const meta = document.createElement("div");
            meta.className = "workout-log-meta";
            meta.innerHTML = [
                `<span><i class="fa-solid fa-layer-group" aria-hidden="true"></i> ${escapeHtml(workout.type)}</span>`,
                workout.duration ? `<span><i class="fa-solid fa-clock" aria-hidden="true"></i> ${escapeHtml(workout.duration)} phút</span>` : "",
                workout.calories !== "" ? `<span><i class="fa-solid fa-fire" aria-hidden="true"></i> ${escapeHtml(workout.calories)} kcal</span>` : "",
                `<span><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> ${escapeHtml(formatDate(workout.date))}</span>`
            ].filter(Boolean).join("");

            content.appendChild(title);
            content.appendChild(meta);

            if (workout.note) {
                const note = document.createElement("p");
                note.className = "workout-log-note";
                note.textContent = workout.note;
                content.appendChild(note);
            }

            const actions = document.createElement("div");
            actions.className = "workout-log-actions";

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Xóa";
            button.className = "btn-log-delete";
            button.addEventListener("click", function () {
                window.deleteWorkout(index);
            });

            actions.appendChild(button);
            top.appendChild(content);
            top.appendChild(actions);
            row.appendChild(top);
            list.appendChild(row);
        });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            }[char];
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
