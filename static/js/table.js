const shiftTableEl = document.getElementById('shiftTable');
const currentYearMonthEl = document.getElementById('currentYearMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
// const shiftInfoContainer = document.getElementById('shiftInfoContainer')

let currentDate = new Date();
let shifts = {};

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function displayCurrentYearMonth(date) {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    currentYearMonthEl.textContent = `${date.getFullYear()}年 ${monthNames[date.getMonth()]}`;
}

function generateShiftTable(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1);
    const employees = getUniqueEmployees(year, month);

    let tableHtml = '<table><thead><tr><th>日付</th>';
    employees.forEach(employee => {
        tableHtml += `<th>${employee.last_name}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const formattedDate = formatDate(date);
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        tableHtml += `<tr><td>${day}(${dayOfWeek})</td>`;

        

        employees.forEach(employee => {
            
            //shiftInfoContainer.innerHTML = '';  // 表示をリセット
            const shiftData = shifts[formattedDate]?.find(s => s.user === employee.account_id);

            const shiftSymbol = getShiftSymbol(shiftData?.shift_type);
            tableHtml += `<td class="shift_symbol">${shiftSymbol}</td>`;

        });

        tableHtml += '</tr>';
        
    }

    tableHtml += '</tbody></table>';
    shiftTableEl.innerHTML = tableHtml;
    displayCurrentYearMonth(firstDay);
}

function getUniqueEmployees(year, month) {
    const employees = new Set();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const formattedDate = formatDate(new Date(year, month, day));
        if (shifts[formattedDate]) {
            shifts[formattedDate].forEach(shift => {
                //if (shift.user) employees.add(shift.user);
                if (shift.user && shift.last_name) {
                    employees.set(shift.user, { account_id: shift.user, last_name: shift.last_name });
                }
            });
        }
    }
    // return Array.from(employees);
    return Array.from(employees.values());
}

function getShiftSymbol(shiftType) {
    switch(shiftType) {
        case 'Dinner': return '○';  // Dinnerは○
        case 'Lunch': return '△';   // Lunchは△
        case 'Or': return '☆';      // Orは★
        case 'Full': return '◎';    // Fullは◎
        default: return '×';
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
});

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
        shifts = result.shifts.reduce((acc, shift) => {
            if (!acc[shift.date]) {
                acc[shift.date] = [];
            }
            acc[shift.date].push({
                user: shift.user.account_id,
                username: shift.user.last_name,
                shift: shift.shift,
                shift_type: shift.shift_type,
            });
            return acc;
        }, {});

        generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
    } catch (error) {
        console.error('Error fetching shifts:', error);
    }
}

// 初期設定
fetchShifts();