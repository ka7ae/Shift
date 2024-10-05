const shiftTableEl = document.getElementById('shiftTable');
const currentYearMonthEl = document.getElementById('currentYearMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentUserID = document.getElementById('currentuserId');
// const shiftSelectModal = document.getElementById('shiftSelectModal');
// const modalSelectDateEl = document.getElementById('modalSelectDate');
// const cancelShiftBtn = document.getElementById('cancelSelectShift');
// const saveShiftBtn = document.getElementById('confirmShiftChange');

// const shiftInfoContainer = document.getElementById('shiftInfoContainer')

let currentDate = new Date();
let allAccounts = {};
let shifts = {};

console.log("user ID",currentUserID);
const canEditAllShifts = currentUserID.startWith('0'); //0から始まるか確認




function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}


function displayCurrentYearMonth(date) {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    currentYearMonthEl.textContent = `${date.getFullYear()}年 ${monthNames[date.getMonth()]}`;
}


prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
});



function generateShiftTable(year, month) {
    console.log("Generating shift table for", year, month);
    console.log("allAccounts:", allAccounts);
    console.log("shifts:", shifts);
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month , 1);

    let tableHtml = '<table><thead><tr><th>日付</th>';
    allAccounts.forEach(account => {
        tableHtml += `<th>${account.first_name}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const formattedDate = formatDate(date);
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        tableHtml += `<tr><td>${i}(${dayOfWeek})</td>`;
        

        allAccounts.forEach(account => {
            const shiftData = Array.isArray(shifts[formattedDate]) 
                  ? shifts[formattedDate].find(s => s.user === account.account_id) : null;
            const shiftType = shiftData?shiftData.shift_type : '';

            if(canEditAllShifts || currentUserID === account.account_id){
                tableHtml += `<td class="shift_symbol" onclick="openShiftModal(new Date(${year}, ${month}, ${i}))">${shiftType}</td>`;
            }else{
                tableHtml += `<td class="shift_symbol">${shiftType}</td>`;
            }

        });

                    

        tableHtml += '</tr>';
        
    }

    tableHtml += '</tbody></table>';
    shiftTableEl.innerHTML = tableHtml;
    displayCurrentYearMonth(firstDay);

}



async function fetchAccounts() {
    try {
        const response = await fetch('/get_allaccounts/');
        if (!response.ok) {
            throw new Error('Failed to fetch accounts');
        }
        const data = await response.json();
        allAccounts = data.accounts;
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}


async function fetchallShifts() {
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
                shift_type: shift.shift_type,
            });
            return acc;
        }, {});

        // generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
    } catch (error) {
        console.error('Error fetching shifts:', error);
    }
}

async function initializeData() {
    await Promise.all([fetchAccounts(), fetchallShifts()]);
    console.log("Account", allAccounts);
    console.log("shift", shifts);
    generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
    console.log("shift table generated");
}

// 初期設定
// fetchallShifts();
document.addEventListener('DOMContentLoaded', initializeData);