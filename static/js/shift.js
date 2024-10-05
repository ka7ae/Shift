const calendarEl = document.getElementById('calendar');
// const currentDateEl = document.getElementById('currentDate');
const currentYearMonthEl = document.getElementById('currentYearMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const shiftModal = document.getElementById('shiftModal');
const modalDateEl = document.getElementById('modalDate');
const shiftInfoContainer = document.getElementById('shiftInfoContainer')
const cancelShiftBtn = document.getElementById('cancelShift');


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


function displayCurrentYearMonth(year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    currentYearMonthEl.textContent = `${year} ${monthNames[month]}`;
}


function openShiftModal(date) {
    const formattedDate = formatDate(date);
    modalDateEl.textContent = formattedDate;
    if (shifts[formattedDate]) {
        const shiftDataArray = shifts[formattedDate];
        shiftInfoContainer.innerHTML = '';  // 表示をリセット
 
        shiftDataArray.forEach(shiftData => {

            const shiftInfo = document.createElement('div');
            shiftInfo.classList.add('shift-info');

            const userEl = document.createElement('span');
            userEl.textContent = shiftData.last_name ? shiftData.last_name+shiftData.first_name : 'No user_id';
            shiftInfo.appendChild(userEl);

            const shiftTypeElItem = document.createElement('span');
            shiftTypeElItem.textContent = shiftData.shift_type;
            shiftInfo.appendChild(shiftTypeElItem);

            shiftInfoContainer.appendChild(shiftInfo);
            
        });

    }
 
    shiftModal.style.display = 'block';
}


function closeShiftModal() {
    shiftModal.style.display = 'none';
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
        const shiftDataArray = shifts[formattedDate] || [];
        const shiftType = shiftDataArray.length > 0 ? [shiftDataArray.length]  : '';

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


cancelShiftBtn.addEventListener('click',closeShiftModal);



async function fetchShifts() {
    const url = '/get_allshifts/';
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
            if (!shifts[shift.date]) {
                shifts[shift.date] = [];
            }
            shifts[shift.date].push({
                first_name: shift.user.first_name,
                last_name: shift.user.last_name,
                shift_type: shift.shift_type,
            });
        });

        generateCalendar(currentYear, currentDisplayedMonth); // カレンダーを再描画
    } catch (error) {
        console.error('Error fetching shifts:', error);
    }
}




// 初期設定
fetchShifts(); // ページロード時にシフトデータを取得