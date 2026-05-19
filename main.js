// ==========================================
// 1. LOGIC TÍNH CHỈ SỐ BMI
// ==========================================
function calculateBMI() {
    const heightCm = parseFloat(document.getElementById('heightInput').value);
    const weight = parseFloat(document.getElementById('weightInput').value);

    if (heightCm > 0 && weight > 0) {
        const heightM = heightCm / 100;
        const bmi = (weight / (heightM * heightM)).toFixed(1);
        alert(`Chỉ số BMI của bạn là: ${bmi}`);
    } else {
        alert('Vui lòng nhập chiều cao và cân nặng hợp lệ!');
    }
}

// ==========================================
// 2. VÒNG TRÒN TIẾN TRÌNH NƯỚC (WATER LOGIC)
// ==========================================
function setWaterProgress(percent) {
    const circle = document.getElementById('waterCircle');
    if (circle) {
        circle.style.background = `conic-gradient(#1dd1a1 0% ${percent}%, #e0e0e0 ${percent}% 100%)`;
    }

    const waterAmount = document.getElementById('waterAmount');
    if (waterAmount) {
        waterAmount.innerText = percent;
    }
}

// Đặt lượng nước khởi tạo là 75% như trong ảnh mẫu ban đầu hoặc giữ nguyên số hiển thị 100
setWaterProgress(75);

// ==========================================
// 3. ĐỒNG HỒ BẤM GIỜ TẬP LUYỆN (STOPWATCH)
// ==========================================
let seconds = 3; // Bắt đầu từ 00:00:03 giống ảnh mẫu
const stopwatchElement = document.getElementById('stopwatch');

if (stopwatchElement) {
    setInterval(() => {
        seconds++;
        let hrs = Math.floor(seconds / 3600);
        let mins = Math.floor((seconds - (hrs * 3600)) / 60);
        let secs = seconds % 60;

        if (secs < 10) secs = '0' + secs;
        if (mins < 10) mins = '0' + mins;
        if (hrs < 10) hrs = '0' + hrs;

        stopwatchElement.innerText = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

function logWorkout() {
    alert('Đã lưu dữ liệu tập luyện mới thành công!');
}

// ==========================================
// 4. ĐÓNG POPUP TOAST THÔNG BÁO UỐNG NƯỚC
// ==========================================
function closeToast() {
    const toast = document.getElementById('waterToast');
    if (toast) {
        toast.style.display = 'none';
    }
}