const shiftTableEl = document.getElementById('shiftTable');
const currentYearMonthEl = document.getElementById('currentYearMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
// const currentUserID = document.getElementById('currentuserId');
const shiftModal = document.getElementById('shiftTableModal');
const modalDateEl = document.getElementById('TablemodalDate');
const saveShiftBtn = document.getElementById('saveShift');
// const saveEditShiftBtn = document.getElementById('saveEdit');
const cancelShiftBtn = document.getElementById('cancelShift');

// const shiftInfoContainer = document.getElementById('shiftInfoContainer')

let currentDate = new Date();
let allAccounts = {};
let shifts = {};

const canEditAllShifts = currentUserID.toString().startsWith('0'); //0から始まるか確認


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


function openShiftModal(date) {
    const formattedDate = formatDate(date);
    modalDateEl.textContent = formattedDate;

    // シフトデータの存在を確認
    if (shifts[formattedDate] && shifts[formattedDate][0]) { 
        const shiftData = shifts[formattedDate][0]; // 配列の最初の要素を取得
 
        // shift_type が存在するか確認
        if (shiftData.shift_type) {
            const shiftType = shiftData.shift_type;

            // 各チェックボックスの設定
            document.getElementById('tlunchShift').checked = shiftType === '△';
            document.getElementById('t11Shift').checked = shiftType === '△11';
            document.getElementById('tdinnerShift').checked = shiftType === '◯';
            document.getElementById('t17Shift').checked = shiftType === '◯17';
            document.getElementById('torShift').checked = shiftType === '☆';
            document.getElementById('tfullShift').checked = shiftType === '◎';
            document.getElementById('tNoShift').checked = shiftType === '✕';
        } else {
            console.log("No shift_type found for the selected date.");
        }
    } else {
        console.log("No shift data found for the selected date.");
    }

    shiftModal.style.display = 'block';
}


function closeShiftModal() {
    shiftModal.style.display = 'none';
}


function generateShiftTable(year, month) {
    
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
            const shiftType = shiftData?shiftData.shift_type:'';

            if(shiftType !== ''){
                if( canEditAllShifts || currentUserID === account.account_id){
                    tableHtml += `<td class="shift_symbol" onclick="openShiftModal(new Date(${year}, ${month}, ${i}))">${shiftType}</td>`;
                }else{
                    tableHtml += `<td class="shift_symbol">${shiftType}</td>`;
                }
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
        generateShiftTable(currentYear, currentDisplayedMonth); // カレンダーを再描画
        closeShiftModal();
    } catch (error) {
        console.error('Error saving shift:', error);
    }
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
    generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
    console.log("shift table generated");
}

// 初期設定
document.addEventListener('DOMContentLoaded', initializeData);