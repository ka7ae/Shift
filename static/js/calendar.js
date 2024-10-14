const calendarEl = document.getElementById('calendar');
const currentYearMonthEl = document.getElementById('currentYearMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const shiftModal = document.getElementById('shiftModal');
const modalDateEl = document.getElementById('modalDate');
const saveShiftBtn = document.getElementById('saveShift');
// const saveEditShiftBtn = document.getElementById('saveEdit');
const cancelShiftBtn = document.getElementById('cancelShift');
const deleteShiftBtn = document.getElementById('deleteShift');



let date = new Date();
let currentYear = date.getFullYear();
let currentMonth = date.getMonth();
let currentDisplayedMonth = currentMonth;
const today = new Date();
let shifts = {}; // シフトを保存するオブジェクト

// console.log("user ID",currentUserID);
// const canEditAllShifts = currentUserID.startsWith('0'); //0から始まるか確認

// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }


function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}



function displayCurrentYearMonth(year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    currentYearMonthEl.textContent = `${year}  ${monthNames[month]}`;
}

function openShiftModal(date) {
    const formattedDate = formatDate(date);
    modalDateEl.textContent = formattedDate;
    // shiftInput.value = shifts[formattedDate] ? shifts[formattedDate].shift : ''; // 既存のシフト情報を表示

    
    if (shifts[formattedDate]) {
        const shiftType = shifts[formattedDate].shift_type;
        document.getElementById('lunchShift').checked = shiftType === '△';
        document.getElementById('dinnerShift').checked = shiftType === '◯';
        document.getElementById('11Shift').checked = shiftType === '△11';
        document.getElementById('17Shift').checked = shiftType === '◯17';
        document.getElementById('orShift').checked = shiftType === '☆';
        document.getElementById('fullShift').checked = shiftType === '◎';
        document.getElementById('NoShift').checked = shiftType === '✕';
    } else {
        document.getElementById('lunchShift').checked = false;
        document.getElementById('dinnerShift').checked = false;
        document.getElementById('11Shift').checked = false;
        document.getElementById('17Shift').checked = false;
        document.getElementById('orShift').checked = false;
        document.getElementById('fullShift').checked = false;
        document.getElementById('NoShift').checked = false;
    }

    shiftModal.style.display = 'block';
}


function closeShiftModal() {
    shiftModal.style.display = 'none';
}


async function deleteShift(date, shiftType) {
    const url = '/shift_delete/';  // DjangoのビューにDELETEするURL
    const data = { date, shift_type: shiftType };

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to delete shift');
        }

        console.log('Shift deleted successfully');
        delete shifts[formatDate(new Date(date))];
        closeShiftModal();
        generateCalendar(currentYear, currentDisplayedMonth);
        
        
    } catch (error) {
        console.error('Error deleting shift:', error);
    }
}


async function saveShift(date,  shiftType) {
    const url = '/shift_form/';  // DjangoのビューにPOSTするURL
    const data = { date,  shift_type: shiftType };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken, // CSRFトークンをヘッダーに追加
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to save shift');
        }
        // 追記
        const result = await response.json();
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to save shift');
        }

        console.log('Shift saved successfully'); 
        shifts[date] = { shift_type: shiftType }; //シフトデータを更新
        generateCalendar(currentYear, currentDisplayedMonth); // カレンダーを再描画
        closeShiftModal();
    } catch (error) {
        console.error('Error saving shift:', error);
    }
}


function generateCalendar(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // カレンダーのHTML構造を生成
    let calendarHtml = '<table><thead><tr>';
    for (let i = 0; i < 7; i++) {
        calendarHtml += `<th>${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</th>`;
    }
    calendarHtml += '</tr></thead><tbody><tr>';

    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        calendarHtml += '<td></td>';
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayOfWeek = new Date(year, month, i).getDay();
        if (dayOfWeek === 0 && i !== 1) {
            calendarHtml += '</tr><tr>';
        }
        const isToday = year === today.getFullYear() && month === today.getMonth() && i === today.getDate();
        const date = new Date(year, month, i);

        const formattedDate = formatDate(date);
        const shiftData = shifts[formattedDate] || {};
        const shiftType = shiftData.shift_type ? shiftData.shift_type : '';
        calendarHtml += `<td class="${isToday ? 'today' : ''}" onclick="openShiftModal(new Date(${year}, ${month}, ${i}))">${i}<br>${shiftType}</td>`;
    
    }

    const lastDay = new Date(year, month, daysInMonth).getDay();
    for (let i = lastDay + 1; i <= 6; i++) {
        calendarHtml += '<td></td>';
    }
    calendarHtml += '</tr></tbody></table>';
    calendarEl.innerHTML = calendarHtml;
    displayCurrentYearMonth(year, month); // 現在の月と年を表示
}



async function fetchShifts() {
    const url = '/get_shifts/';
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch shifts');
        }

        const result = await response.json();
        const shiftsData = result.shifts;

        shiftsData.forEach(shift => {
            shifts[shift.date] = {
                shift_type: shift.shift_type,
            };
        });

        generateCalendar(currentYear, currentDisplayedMonth); // カレンダーを再描画
    } catch (error) {
        console.error('Error fetching shifts:', error);
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDisplayedMonth--;
    if (currentDisplayedMonth < 0) {
        currentDisplayedMonth = 11;
        currentYear--;
    }
    generateCalendar(currentYear, currentDisplayedMonth);
});

nextMonthBtn.addEventListener('click', () => {
    currentDisplayedMonth++;
    if (currentDisplayedMonth > 11) {
        currentDisplayedMonth = 0;
        currentYear++;
    }
    generateCalendar(currentYear, currentDisplayedMonth);
});


saveShiftBtn.addEventListener('click', () => {
    const date = modalDateEl.textContent;
    // const shift = shiftInput.value;
    const shiftTypeElement = document.querySelector('input[name="shiftType"]:checked');

    if (!shiftTypeElement) {
        alert('Please select a shift type.');
        return;
    }

    const shiftType = shiftTypeElement.value;
    saveShift(date, shiftType);
});

cancelShiftBtn.addEventListener('click', closeShiftModal);

deleteShiftBtn.addEventListener('click', () => {
    const date = modalDateEl.textContent;
    const shiftTypeElement = document.querySelector('input[name="shiftType"]:checked');
    const shiftType = shiftTypeElement.value;
    deleteShift(date, shiftType);
});



// 初期表示
// displayCurrentDate();
fetchShifts(); // ページロード時にシフトデータを取得
// document.addEventListener('DOMContentLoaded', initializeData);