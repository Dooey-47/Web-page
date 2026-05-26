/* main.js - shared frontend behavior for split pages
   jQuery 4.0-compatible version.

   Notes for jQuery 4:
   - Do not use $.trim, $.parseJSON, $.now, $.type, etc. They were removed.
   - This file still uses jQuery for DOM ready, selectors, events, DOM creation,
     value/text updates, show/hide, append/after/empty, and class handling.
*/

(function ($) {
    "use strict";

    if (!$) {
        console.error("jQuery is required before js/main.js");
        return;
    }

    $(function () {
        const $heightInput = $("#heightInput");
        const $weightInput = $("#weightInput");
        const $reminderTime = $("#reminderTime");
        const $waterToast = $("#waterToast");
        const $stopwatch = $("#stopwatch");
        const $workoutForm = $("#workoutForm");
        const today = getTodayInputValue();

        let reminder = null;
        let seconds = 0;
        let workouts = loadWorkouts();

        window.calculateBMI = function () {
            if (!$heightInput.length || !$weightInput.length) {
                return false;
            }

            const height = parseFloat($heightInput.val());
            const weight = parseFloat($weightInput.val());

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

            const $result = $("#bmiResult");
            if ($result.length) {
                $("#bmiScore").text(bmi.toFixed(1));
                $("#bmiCategory").text(`Phân loại: ${category}`);
                $("#bmiCopy").text(copy);
                $result.addClass("is-visible");
            } else {
                alert(`BMI: ${bmi.toFixed(1)}\n\nPhân loại: ${category}`);
            }

            return false;
        };

        window.showWaterToast = function () {
            if ($waterToast.length) {
                $waterToast.css("display", "flex");
            }
        };

        window.closeToast = function () {
            if ($waterToast.length) {
                $waterToast.hide();
            }
        };

        window.logWorkout = function (event) {
            if (event) {
                event.preventDefault();
            }

            if ($workoutForm.length) {
                return logWorkoutFromForm();
            }

            const exercise = prompt("Nhập bài tập:");
            const exerciseName = trimValue(exercise);

            if (!exerciseName) {
                return false;
            }

            workouts.unshift({
                id: Date.now(),
                name: exerciseName,
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

        initBootstrapDropdownFallback();
        initSavedBmiInputs();
        initWaterReminder();
        initStopwatch();
        initWorkoutForm();

        function initBootstrapDropdownFallback() {
            // Bootstrap handles dropdowns when it is loaded. This fallback only runs
            // when Bootstrap JS is missing or unavailable in a static/offline demo.
            $(".dropdown-toggle").on("click.dropdownFallback", function (event) {
                if (window.bootstrap) {
                    return;
                }

                const $toggle = $(this);
                const $menu = $toggle.parent().find(".dropdown-menu").first();

                if (!$menu.length) {
                    return;
                }

                event.preventDefault();
                $menu.toggle();
            });
        }

        function initSavedBmiInputs() {
            if ($heightInput.length) {
                const savedHeight = safeGet("height", "");
                if (savedHeight) {
                    $heightInput.val(savedHeight);
                }
            }

            if ($weightInput.length) {
                const savedWeight = safeGet("weight", "");
                if (savedWeight) {
                    $weightInput.val(savedWeight);
                }
            }
        }

        function initWaterReminder() {
            if ($waterToast.length) {
                $waterToast.hide();
            }

            if (!$reminderTime.length) {
                return;
            }

            $reminderTime.on("change", function () {
                clearInterval(reminder);
                const minute = parseInt($(this).val(), 10);

                if (!Number.isNaN(minute) && minute > 0 && $waterToast.length) {
                    reminder = setInterval(window.showWaterToast, minute * 60000);
                }
            });
        }

        function initStopwatch() {
            if (!$stopwatch.length) {
                return;
            }

            setInterval(function () {
                seconds += 1;
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const s = seconds % 60;
                const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

                $stopwatch.text(time).attr("datetime", `PT${seconds}S`);
            }, 1000);
        }

        function initWorkoutForm() {
            const $exerciseDate = $("#exerciseDate");

            if ($exerciseDate.length && !$exerciseDate.val()) {
                $exerciseDate.val(today);
            }

            if ($workoutForm.length) {
                // If the HTML still has inline onsubmit from an earlier version,
                // remove it so the form is handled only once through jQuery.
                $workoutForm
                    .removeAttr("onsubmit")
                    .off("submit.workout")
                    .on("submit.workout", window.logWorkout);
            }

            if ($workoutForm.length || $(".btn-log").length) {
                ensureWorkoutListContainer();
                renderWorkout();
            }
        }

        function logWorkoutFromForm() {
            const $exerciseName = $("#exerciseName");
            const $exerciseType = $("#exerciseType");
            const $exerciseDuration = $("#exerciseDuration");
            const $exerciseCalories = $("#exerciseCalories");
            const $exerciseDate = $("#exerciseDate");
            const $exerciseNote = $("#exerciseNote");

            if (!$exerciseName.length || !$exerciseDuration.length) {
                showWorkoutStatus("Không tìm thấy form tạo log. Hãy kiểm tra id của các input.", true);
                return false;
            }

            const name = trimValue($exerciseName.val());
            const type = $exerciseType.val() || "Khác";
            const duration = parseInt($exerciseDuration.val(), 10);
            const caloriesValue = $exerciseCalories.length ? $exerciseCalories.val() : "";
            const calories = caloriesValue === "" ? "" : parseInt(caloriesValue, 10);
            const date = $exerciseDate.val() || today;
            const note = trimValue($exerciseNote.val());

            if (!name) {
                alert("Vui lòng nhập tên bài tập");
                $exerciseName.trigger("focus");
                return false;
            }

            if (Number.isNaN(duration) || duration <= 0) {
                alert("Thời gian tập phải lớn hơn 0 phút");
                $exerciseDuration.trigger("focus");
                return false;
            }

            if (calories !== "" && (Number.isNaN(calories) || calories < 0)) {
                alert("Calories không được nhỏ hơn 0");
                $exerciseCalories.trigger("focus");
                return false;
            }

            workouts.unshift({
                id: Date.now(),
                name,
                type,
                duration,
                calories,
                date,
                note
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
            if (!$workoutForm.length) {
                return;
            }

            $workoutForm[0].reset();
            $("#exerciseDate").val(today);
            $("#exerciseName").trigger("focus");
        }

        function showWorkoutStatus(message, isError) {
            const $status = $("#workoutStatus");

            if (!$status.length) {
                alert(message);
                return;
            }

            $status
                .text(message)
                .css("color", isError ? "#c0392b" : "#12856a")
                .addClass("is-visible");

            setTimeout(function () {
                $status.removeClass("is-visible");
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
            try {
                localStorage.setItem("workouts", JSON.stringify(workouts));
                return true;
            } catch (error) {
                console.error("Không thể lưu workout log:", error);
                return false;
            }
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

        function formatDate(value) {
            if (!value) {
                return "Chưa chọn ngày";
            }

            const parts = String(value).split("-");
            if (parts.length !== 3) {
                return value;
            }

            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        function getTodayInputValue() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }

        function trimValue(value) {
            // jQuery 4 removed $.trim, so use the native string trim safely.
            return value == null ? "" : String(value).trim();
        }

        function ensureWorkoutListContainer() {
            if ($("#workoutList").length) {
                return;
            }

            const $list = $("<div>", {
                id: "workoutList",
                class: "workout-list",
                "aria-live": "polite"
            });

            if ($workoutForm.length) {
                $workoutForm.after($list);
            }
        }

        function buildMetaItem(iconClass, text) {
            return $("<span>")
                .append($("<i>", {
                    class: iconClass,
                    "aria-hidden": "true"
                }))
                .append(document.createTextNode(` ${text}`));
        }

        function renderWorkout() {
            ensureWorkoutListContainer();
            const $list = $("#workoutList");

            if (!$list.length) {
                return;
            }

            $list.empty();

            if (!workouts.length) {
                $list.append($("<p>", {
                    class: "workout-empty",
                    text: "Chưa có log nào. Điền form bên trên rồi bấm TẠO LOG TẬP LUYỆN."
                }));
                return;
            }

            workouts.forEach(function (item, index) {
                const workout = normalizeWorkout(item);
                workouts[index] = workout;

                const $row = $("<article>", { class: "workout-log-item" });
                const $top = $("<div>", { class: "workout-log-top" });
                const $content = $("<div>");

                const $title = $("<h3>", {
                    class: "workout-log-name",
                    text: workout.name
                });

                const $meta = $("<div>", { class: "workout-log-meta" })
                    .append(buildMetaItem("fa-solid fa-layer-group", workout.type));

                if (workout.duration) {
                    $meta.append(buildMetaItem("fa-solid fa-clock", `${workout.duration} phút`));
                }

                if (workout.calories !== "") {
                    $meta.append(buildMetaItem("fa-solid fa-fire", `${workout.calories} kcal`));
                }

                $meta.append(buildMetaItem("fa-solid fa-calendar-day", formatDate(workout.date)));
                $content.append($title, $meta);

                if (workout.note) {
                    $content.append($("<p>", {
                        class: "workout-log-note",
                        text: workout.note
                    }));
                }

                const $actions = $("<div>", { class: "workout-log-actions" });
                const $button = $("<button>", {
                    type: "button",
                    text: "Xóa",
                    class: "btn-log-delete"
                }).on("click", function () {
                    window.deleteWorkout(index);
                });

                $actions.append($button);
                $top.append($content, $actions);
                $row.append($top);
                $list.append($row);
            });
        }
    });
})(window.jQuery);
