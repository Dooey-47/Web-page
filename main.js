/* main.js - jQuery version
   Giữ nguyên các ID/class HTML hiện tại để hoạt động với cả index.html và index_b2c.html.
*/

$(function () {
    const $heightInput = $("#heightInput");
    const $weightInput = $("#weightInput");
    const $reminderTime = $("#reminderTime");
    const $waterToast = $("#waterToast");
    const $stopwatch = $("#stopwatch");
    const $workoutContainer = $(".workout-card-content");

    let reminder = null;
    let seconds = 0;
    let workouts = loadWorkouts();

    // Khôi phục chiều cao/cân nặng đã lưu
    const savedHeight = localStorage.getItem("height");
    const savedWeight = localStorage.getItem("weight");

    if (savedHeight) {
        $heightInput.val(savedHeight);
    }

    if (savedWeight) {
        $weightInput.val(savedWeight);
    }

    // Hàm tính BMI - giữ global vì HTML đang gọi inline: onsubmit="calculateBMI(); return false;"
    window.calculateBMI = function () {
        const height = parseFloat($heightInput.val());
        const weight = parseFloat($weightInput.val());

        if (Number.isNaN(height) || Number.isNaN(weight)) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (height <= 0 || weight <= 0) {
            alert("Chiều cao và cân nặng phải lớn hơn 0");
            return;
        }

        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        let category = "";

        if (bmi < 18.5) {
            category = "Gầy";
        } else if (bmi < 25) {
            category = "Bình thường";
        } else if (bmi < 30) {
            category = "Thừa cân";
        } else {
            category = "Béo phì";
        }

        alert(`BMI: ${bmi.toFixed(1)}\nPhân loại: ${category}`);

        localStorage.setItem("height", height);
        localStorage.setItem("weight", weight);
    };

    // Nhắc uống nước
    $reminderTime.on("change", function () {
        clearInterval(reminder);

        const minute = parseInt($(this).val(), 10);

        if (!Number.isNaN(minute) && minute > 0) {
            reminder = setInterval(function () {
                $waterToast.css("display", "flex");
            }, minute * 60000);
        }
    });

    // Hàm đóng thông báo - giữ global vì HTML đang gọi inline: onclick="closeToast()"
    window.closeToast = function () {
        $waterToast.hide();
    };

    // Đồng hồ chạy
    setInterval(function () {
        seconds += 1;

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const formattedTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

        $stopwatch.text(formattedTime);
        $stopwatch.attr("datetime", `PT${seconds}S`);
    }, 1000);

    // Thêm bài tập - giữ global vì HTML đang gọi inline: onclick="logWorkout()"
    window.logWorkout = function () {
        const exercise = prompt("Nhập bài tập:");

        if (!exercise || $.trim(exercise) === "") {
            return;
        }

        workouts.push($.trim(exercise));
        saveWorkouts();
        renderWorkout();
    };

    // Xóa bài tập - giữ global vì các nút xóa gọi inline: onclick="deleteWorkout(index)"
    window.deleteWorkout = function (index) {
        workouts.splice(index, 1);
        saveWorkouts();
        renderWorkout();
    };

    function loadWorkouts() {
        try {
            return JSON.parse(localStorage.getItem("workouts")) || [];
        } catch (error) {
            console.warn("Không thể đọc danh sách bài tập từ localStorage:", error);
            return [];
        }
    }

    function saveWorkouts() {
        localStorage.setItem("workouts", JSON.stringify(workouts));
    }

    function renderWorkout() {
        $("#workoutList").remove();

        const $list = $("<div>", {
            id: "workoutList",
            class: "mt-3 d-grid gap-2"
        });

        workouts.forEach(function (item, index) {
            const $row = $("<div>", {
                class: "d-flex align-items-center justify-content-between gap-2 p-2 border rounded bg-light"
            });

            const $name = $("<span>", {
                class: "text-break"
            }).text(item);

            const $deleteButton = $("<button>", {
                type: "button",
                class: "btn btn-sm btn-outline-danger",
                text: "Xóa",
                click: function () {
                    window.deleteWorkout(index);
                }
            });

            $row.append($name, $deleteButton);
            $list.append($row);
        });

        $workoutContainer.append($list);
    }

    renderWorkout();

    // API giả - chuyển từ fetch sang $.getJSON để dùng jQuery rõ ràng hơn
    $.getJSON("https://jsonplaceholder.typicode.com/users/1")
        .done(function (data) {
            console.log(data.name);
        })
        .fail(function (_jqXHR, _textStatus, errorThrown) {
            console.log(errorThrown);
        });
});
