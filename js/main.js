/* main.js - shared frontend behavior for split pages */

$(function(){

const $heightInput = $("#heightInput");
const $weightInput = $("#weightInput");
const $reminderTime = $("#reminderTime");
const $waterToast = $("#waterToast");
const $stopwatch = $("#stopwatch");

let reminder = null;
let seconds = 0;
let workouts = loadWorkouts();

if ($waterToast.length) {
    $waterToast.hide();
}

if ($heightInput.length) {
    const savedHeight = localStorage.getItem("height");
    if (savedHeight) {
        $heightInput.val(savedHeight);
    }
}

if ($weightInput.length) {
    const savedWeight = localStorage.getItem("weight");
    if (savedWeight) {
        $weightInput.val(savedWeight);
    }
}

window.calculateBMI = function(){
    if (!$heightInput.length || !$weightInput.length) {
        return;
    }

    const height = parseFloat($heightInput.val());
    const weight = parseFloat($weightInput.val());

    if (Number.isNaN(height) || Number.isNaN(weight)) {
        alert("Vui lòng nhập đủ dữ liệu");
        return;
    }

    if (height <= 0 || weight <= 0) {
        alert("Dữ liệu phải lớn hơn 0");
        return;
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

    localStorage.setItem("height", height);
    localStorage.setItem("weight", weight);

    const $result = $("#bmiResult");
    if ($result.length) {
        $("#bmiScore").text(bmi.toFixed(1));
        $("#bmiCategory").text(`Phân loại: ${category}`);
        $("#bmiCopy").text(copy);
        $result.addClass("is-visible");
    } else {
        alert(`BMI:${bmi.toFixed(1)}\n\nPhân loại:${category}`);
    }
};

$reminderTime.on("change", function(){
    clearInterval(reminder);
    const minute = parseInt($(this).val(), 10);

    if (!Number.isNaN(minute) && minute > 0 && $waterToast.length) {
        reminder = setInterval(function(){
            window.showWaterToast();
        }, minute * 60000);
    }
});

window.showWaterToast = function(){
    if ($waterToast.length) {
        $waterToast.css("display", "flex");
    }
};

window.closeToast = function(){
    if ($waterToast.length) {
        $waterToast.hide();
    }
};

if ($stopwatch.length) {
    setInterval(function(){
        seconds++;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const time = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

        $stopwatch.text(time);
        $stopwatch.attr("datetime", `PT${seconds}S`);
    }, 1000);
}

window.logWorkout = function(){
    const exercise = prompt("Nhập bài tập:");

    if (!exercise || $.trim(exercise) === "") {
        return;
    }

    workouts.push($.trim(exercise));
    saveWorkouts();
    renderWorkout();
};

window.deleteWorkout = function(index){
    workouts.splice(index, 1);
    saveWorkouts();
    renderWorkout();
};

function loadWorkouts(){
    try {
        return JSON.parse(localStorage.getItem("workouts")) || [];
    } catch {
        return [];
    }
}

function saveWorkouts(){
    localStorage.setItem("workouts", JSON.stringify(workouts));
}

function renderWorkout(){
    if (!$('.btn-log').length) {
        return;
    }

    $("#workoutList").remove();

    const $list = $("<div>", {
        id: "workoutList",
        class: "mt-3 d-grid gap-2"
    });

    if (!workouts.length) {
        $list.append($("<p>", {
            class: "text-muted mb-0",
            text: "Chưa có bài tập nào. Bấm LOG MỚI để thêm buổi tập đầu tiên."
        }));
    }

    workouts.forEach(function(item, index){
        const $row = $("<div>", {
            class: "d-flex justify-content-between align-items-center border rounded p-2 bg-light"
        });

        const $name = $("<span>").text(item);

        const $button = $("<button>", {
            type: "button",
            text: "Xóa",
            class: "btn btn-danger btn-sm",
            click: function(){
                window.deleteWorkout(index);
            }
        });

        $row.append($name, $button);
        $list.append($row);
    });

    $(".btn-log").before($list);
}

renderWorkout();

});
