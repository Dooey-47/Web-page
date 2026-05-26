/* main.js */

$(function(){

// lấy phần tử
const $heightInput=$("#heightInput");
const $weightInput=$("#weightInput");
const $reminderTime=$("#reminderTime");
const $waterToast=$("#waterToast");
const $stopwatch=$("#stopwatch");

// biến dùng chung
let reminder=null;
let seconds=0;

// lấy dữ liệu bài tập
let workouts=loadWorkouts();

// ẩn thông báo ban đầu
$waterToast.hide();


// khôi phục BMI đã lưu
let savedHeight=localStorage.getItem("height");
let savedWeight=localStorage.getItem("weight");

if(savedHeight){
    $heightInput.val(savedHeight);
}

if(savedWeight){
    $weightInput.val(savedWeight);
}


// tính BMI
window.calculateBMI=function(){

    let height=parseFloat(
        $heightInput.val()
    );

    let weight=parseFloat(
        $weightInput.val()
    );

    // kiểm tra dữ liệu
    if(
        Number.isNaN(height)
        ||
        Number.isNaN(weight)
    ){
        alert("Vui lòng nhập đủ dữ liệu");
        return;
    }

    if(
        height<=0
        ||
        weight<=0
    ){
        alert("Dữ liệu phải lớn hơn 0");
        return;
    }

    // đổi cm sang m
    let heightM=height/100;

    // tính BMI
    let bmi=
    weight/
    (heightM*heightM);

    let category="";

    // phân loại
    if(bmi<18.5){
        category="Gầy";
    }

    else if(bmi<25){
        category="Bình thường";
    }

    else if(bmi<30){
        category="Thừa cân";
    }

    else{
        category="Béo phì";
    }

    // hiện kết quả
    alert(
`BMI:${bmi.toFixed(1)}

Phân loại:${category}`
    );

    // lưu dữ liệu
    localStorage.setItem(
        "height",
        height
    );

    localStorage.setItem(
        "weight",
        weight
    );

};


// nhắc uống nước
$reminderTime.on(
"change",
function(){

    clearInterval(reminder);

    let minute=
    parseInt(
        $(this).val()
    );

    if(
        !Number.isNaN(minute)
        &&
        minute>0
    ){

        reminder=
        setInterval(

        function(){

            $waterToast.css(
            "display",
            "flex"
            );

        },

        minute*60000

        );

    }

});


// đóng thông báo
window.closeToast=
function(){

    $waterToast.hide();

};


// đồng hồ
setInterval(

function(){

    seconds++;

    let h=
    Math.floor(
        seconds/3600
    );

    let m=
    Math.floor(
    (seconds%3600)/60
    );

    let s=
    seconds%60;

    let time=

`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

    $stopwatch.text(time);

    $stopwatch.attr(
    "datetime",
    `PT${seconds}S`
    );

},

1000

);


// thêm bài tập
window.logWorkout=
function(){

    let exercise=
    prompt(
    "Nhập bài tập:"
    );

    if(
        !exercise
        ||
        $.trim(exercise)===""
    ){
        return;
    }

    workouts.push(
    $.trim(exercise)
    );

    saveWorkouts();

    renderWorkout();

};


// xóa bài tập
window.deleteWorkout=
function(index){

    workouts.splice(
    index,
    1
    );

    saveWorkouts();

    renderWorkout();

};


// đọc dữ liệu
function loadWorkouts(){

    try{

        return JSON.parse(
        localStorage.getItem(
        "workouts"
        )
        )||[];

    }

    catch{

        return [];

    }

}


// lưu dữ liệu
function saveWorkouts(){

localStorage.setItem(

"workouts",

JSON.stringify(
workouts
)

);

}


// hiện danh sách
function renderWorkout(){

    $("#workoutList")
    .remove();

    const $list=
    $("<div>",{

    id:"workoutList",

    class:
    "mt-3 d-grid gap-2"

    });


    workouts.forEach(

    function(
    item,
    index
    ){

    const $row=
    $("<div>",{

    class:
"d-flex justify-content-between align-items-center border rounded p-2 bg-light"

    });

    const $name=
    $("<span>")
    .text(item);


    const $button=
    $("<button>",{

    type:"button",

    text:"Xóa",

    class:
    "btn btn-danger btn-sm",

    click:function(){

    window.deleteWorkout(
    index
    );

    }

    });


    $row.append(
    $name,
    $button
    );

    $list.append(
    $row
    );

    });

    $(".btn-log")
    .before(
    $list
    );

}


// tải dữ liệu khi mở web
renderWorkout();

});