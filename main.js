$(document).ready(function () {

    // BMI
    $('.btn-bmi').click(function () {
        const heightCm = parseFloat($('#heightInput').val());
        const weight = parseFloat($('#weightInput').val());

        if (heightCm > 0 && weight > 0) {
            const heightM = heightCm / 100;
            const bmi = (weight / (heightM * heightM)).toFixed(1);

            alert(`Chỉ số BMI của bạn là: ${bmi}`);
        } else {
            alert('Vui lòng nhập chiều cao và cân nặng hợp lệ!');
        }
    });


    // Vòng tròn nước
    function setWaterProgress(percent) {
        $('#waterCircle').css(
            'background',
            `conic-gradient(
                #1dd1a1 0% ${percent}%,
                #e0e0e0 ${percent}% 100%
            )`
        );

        $('#waterAmount').text(`${percent}%`);
    }

    setWaterProgress(75);


    // Đồng hồ bấm giờ
    let seconds = 3;
    const $stopwatchElement = $('#stopwatch');

    if ($stopwatchElement.length > 0) {

        setInterval(function () {

            seconds++;

            let hrs = Math.floor(seconds / 3600);
            let mins = Math.floor((seconds % 3600) / 60);
            let secs = seconds % 60;

            hrs = hrs.toString().padStart(2, '0');
            mins = mins.toString().padStart(2, '0');
            secs = secs.toString().padStart(2, '0');

            $stopwatchElement.text(`${hrs}:${mins}:${secs}`);

        }, 1000);
    }


    // Nút log
    $('.btn-log').click(function () {
        alert('Đã lưu dữ liệu tập luyện mới thành công!');
    });


    // Đóng toast
    $('.toast-close').click(function () {
        $('#waterToast').fadeOut(300);
    });

});