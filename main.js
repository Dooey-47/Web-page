document.addEventListener("DOMContentLoaded", function () {

    // lấy ô nhập chiều cao và cân nặng
    const heightInput =
        document.getElementById("heightInput");

    const weightInput =
        document.getElementById("weightInput");


    // hàm tính bmi
    window.calculateBMI = function () {

        // lấy dữ liệu người dùng nhập
        let height =
            parseFloat(heightInput.value);

        let weight =
            parseFloat(weightInput.value);


        // kiểm tra dữ liệu có trống không
        if (
            isNaN(height) ||
            isNaN(weight)
        ) {
            alert(
                "Vui lòng nhập đầy đủ thông tin!"
            );
            return;
        }


        // kiểm tra dữ liệu hợp lệ
        if (
            height <= 0 ||
            weight <= 0
        ) {
            alert(
                "Chiều cao và cân nặng phải lớn hơn 0"
            );
            return;
        }


        // đổi chiều cao sang mét
        let heightM =
            height / 100;


        // tính bmi
        let bmi =
            weight /
            (heightM * heightM);


        // phân loại bmi
        let category = "";

        if (bmi < 18.5)
            category = "Gầy";

        else if (bmi < 25)
            category = "Bình thường";

        else if (bmi < 30)
            category = "Thừa cân";

        else
            category = "Béo phì";


        // hiện kết quả
        alert(
            `BMI: ${bmi.toFixed(1)}
Phân loại: ${category}`
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


    // lấy dữ liệu đã lưu

    if (
        localStorage.getItem("height")
    ) {

        heightInput.value =
            localStorage.getItem(
                "height"
            );
    }


    if (
        localStorage.getItem("weight")
    ) {

        weightInput.value =
            localStorage.getItem(
                "weight"
            );
    }


    // tạo nhắc uống nước
    let reminder;


    // chọn thời gian nhắc
    document
        .getElementById(
            "reminderTime"
        )
        .addEventListener(
            "change",
            function () {

                clearInterval(
                    reminder
                );

                let minute =
                    this.value;


                // hiện thông báo
                reminder =
                    setInterval(() => {

                        document
                            .getElementById(
                                "waterToast"
                            )
                            .style.display =
                            "flex";

                    },
                        minute * 60000
                    );

            }
        );


    // hàm đóng thông báo
    window.closeToast =
        function () {

            document
                .getElementById(
                    "waterToast"
                )
                .style.display =
                "none";

        };


    // tạo đồng hồ chạy
    let seconds = 0;

    setInterval(() => {

        seconds++;

        let h =
            Math.floor(
                seconds / 3600
            );

        let m =
            Math.floor(
                (seconds % 3600) / 60
            );

        let s =
            seconds % 60;


        // hiện thời gian
        document
            .getElementById(
                "stopwatch"
            )
            .innerText =

            `${String(h).padStart(2, "0")}
            :
            ${String(m).padStart(2, "0")}
            :
            ${String(s).padStart(2, "0")}`;

    }, 1000);



    // lấy danh sách tập luyện
    let workouts =
        JSON.parse(
            localStorage.getItem(
                "workouts"
            )
        ) || [];


    // hiện danh sách tập
    function renderWorkout() {

        let old =
            document.getElementById(
                "workoutList"
            );

        if (old) {
            old.remove();
        }

        let div =
            document.createElement(
                "div"
            );

        div.id =
            "workoutList";


        workouts.forEach(
            (item, index) => {

                let row =
                    document.createElement(
                        "div"
                    );

                row.innerHTML =
                    `
                ${item}
                <button onclick=
                "deleteWorkout(${index})">
                Xóa
                </button>
                `;

                div.appendChild(
                    row
                );

            }
        );

        document
            .querySelector(
                ".workout-card-content"
            )
            .appendChild(
                div
            );

    }


    // thêm bài tập
    window.logWorkout =
        function () {

            let exercise =
                prompt(
                    "Nhập bài tập:"
                );

            if (
                !exercise ||
                exercise.trim() == ""
            ) {
                return;
            }

            workouts.push(
                exercise
            );


            // lưu danh sách
            localStorage.setItem(
                "workouts",
                JSON.stringify(
                    workouts
                )
            );

            renderWorkout();

        }


    // xóa bài tập
    window.deleteWorkout =
        function (index) {

            workouts.splice(
                index,
                1
            );

            localStorage.setItem(
                "workouts",
                JSON.stringify(
                    workouts
                )
            );

            renderWorkout();

        }


    renderWorkout();


    // lấy dữ liệu api giả
    fetch(
        "https://jsonplaceholder.typicode.com/users/1"
    )

        .then(
            response =>
                response.json()
        )

        .then(data => {

            console.log(
                data.name
            );

        })

        .catch(error => {

            console.log(
                error
            );

        });

});