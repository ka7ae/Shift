const calendarEl = document.getElementById('calendar');
// const currentDateEl = document.getElementById('currentDate');
const currentYearMonthEl = document.getElementById('currentYearMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const shiftModal = document.getElementById('shiftModal');
const modalDateEl = document.getElementById('modalDate');
const shiftInput = document.getElementById('shiftInput');
const saveShiftBtn = document.getElementById('saveShift');
const cancelShiftBtn = document.getElementById('cancelShift');
const deleteShiftBtn = document.getElementById('deleteShift');
// const csrfToken = getCookie('csrftoken'); // CSRFトークンを取得



let date = new Date();
let currentYear = date.getFullYear();
let currentMonth = date.getMonth();
let currentDisplayedMonth = currentMonth;
const today = new Date();
let shifts = {}; // シフトを保存するオブジェクト

function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

// function displayCurrentDate() {
//     currentDateEl.textContent = formatDate(new Date());
// }

function displayCurrentYearMonth(year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    currentYearMonthEl.textContent = `${year}  ${monthNames[month]}`;
}

// function openShiftModal(date) {
//     modalDateEl.textContent = formatDate(date);
//     shiftInput.value = shifts[formatDate(date)] || ''; // 既存のシフト情報を表示
//     shiftModal.style.display = 'block';
// }

function openShiftModal(date) {
    const formattedDate = formatDate(date);
    modalDateEl.textContent = formattedDate;
    shiftInput.value = shifts[formattedDate] ? shifts[formattedDate].shift : ''; // 既存のシフト情報を表示

    
    if (shifts[formattedDate]) {
        const shiftType = shifts[formattedDate].shift_type;
        document.getElementById('lunchShift').checked = shiftType === 'Lunch';
        document.getElementById('dinnerShift').checked = shiftType === 'Dinner';
        document.getElementById('orShift').checked = shiftType === 'Or';
        document.getElementById('fullShift').checked = shiftType === 'Full';
    } else {
        document.getElementById('lunchShift').checked = false;
        document.getElementById('dinnerShift').checked = false;
        document.getElementById('orShift').checked = false;
        document.getElementById('fullShift').checked = false;
    }

    shiftModal.style.display = 'block';
}


function closeShiftModal() {
    shiftModal.style.display = 'none';
}


async function deleteShift(date, shift, shiftType) {
    const url = '/shift_delete/';  // DjangoのビューにDELETEするURL
    const data = { date, shift, shift_type: shiftType };

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
        // delete shifts[formatDateForDeletion(date)];
        delete shifts[formatDate(new Date(date))];
        // shifts[date] = { shift, shift_type: shiftType };
        closeShiftModal();
        generateCalendar(currentYear, currentDisplayedMonth);
        
        
    } catch (error) {
        console.error('Error deleting shift:', error);
    }
}


async function saveShift(date, shift, shiftType) {
    const url = '/shift_form/';  // DjangoのビューにPOSTするURL
    const data = { date, shift, shift_type: shiftType };

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
        shifts[date] = { shift, shift_type: shiftType }; //シフトデータを更新
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
        


        // const shift = shifts[formattedDate] ? shifts[formattedDate].shift_type : '';
        // const shift = shiftData[formattedDate] ? shiftData[formattedDate].shift_type : '';
        // calendarHtml += `<td class="${isToday ? 'today' : ''}" onclick="openShiftModal(new Date(${year}, ${month}, ${i}))">${i}<br>${shift}</td>`;
        // calendarHtml += `<td class="${isToday ? 'today' : ''}" onclick="openShiftModal(new Date(${year}, ${month}, ${i}))">${i}<br>${shifts[formattedDate] || ''}</td>`;
        // calendarHtml += `<td class="${isToday ? 'today' : ''}" onclick="openShiftModal(new Date(${year}, ${month}, ${i}))">${i}<br>${shifts[formatDate(date)] || ''}</td>`;
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
                shift: shift.shift,
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
    const shift = shiftInput.value;
    const shiftTypeElement = document.querySelector('input[name="shiftType"]:checked');

    if (!shiftTypeElement) {
        alert('Please select a shift type.');
        return;
    }

    const shiftType = shiftTypeElement.value;
    saveShift(date, shift, shiftType);
});

cancelShiftBtn.addEventListener('click', closeShiftModal);

deleteShiftBtn.addEventListener('click', () => {
    const date = modalDateEl.textContent;
    const shift = shiftInput.value;
    const shiftTypeElement = document.querySelector('input[name="shiftType"]:checked');
    const shiftType = shiftTypeElement.value;
    deleteShift(date, shift, shiftType);
    // deleteShift(formatDateForDeletion(new Date(date)), shift, shiftType);  // 修正: 引数を追加
});




// 初期表示
// displayCurrentDate();
fetchShifts(); // ページロード時にシフトデータを取得