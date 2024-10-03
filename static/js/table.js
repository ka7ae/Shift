const shiftTableEl = document.getElementById('shiftTable');
const currentYearMonthEl = document.getElementById('currentYearMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentUserID = document.getElementById('currentuserId');
const shiftSelectModal = document.getElementById('shiftSelectModal');
const modalSelectDateEl = document.getElementById('modalSelectDate');
const cancelShiftBtn = document.getElementById('cancelSelectShift');
const saveShiftBtn = document.getElementById('confirmShiftChange');

// const shiftInfoContainer = document.getElementById('shiftInfoContainer')

let currentDate = new Date();
let allAccounts = {};
let shifts = {};
// const currentUserID = {user,account_id};
console.log(currentUserID);


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

// saveShiftBtn.addEventListener('click', () => {
//     const date = modalSelectDateEl.textContent;
//     // const shift = shiftSelectInput.value;
//     const shiftTypeElement = document.querySelector('input[name="shiftType"]:checked');

//     if (!shiftTypeElement) {
//         alert('Please select a shift type.');
//         return;
//     }

//     const shiftType = shiftTypeElement.value;
//     saveShift(date, shiftType);
// });

// cancelShiftBtn.addEventListener('click', closeShiftModal);


// function openShiftModal(date) {
//     const formattedDate = formatDate(date);
//     modalSelectDateEl.textContent = formattedDate;
//     // shiftSelectInput.value = shifts[formattedDate] ? shifts[formattedDate].shift : ''; // 既存のシフト情報を表示
//     console.log(shifts[formattedDate]);
//     console.log(shifts[formattedDate].user);
    
//     if (shifts[formattedDate]) {
//         const shiftType = shifts[formattedDate].shift_type;
//         document.getElementById('lunchShift').checked = shiftType === 'Lunch';
//         document.getElementById('dinnerShift').checked = shiftType === 'Dinner';
//         document.getElementById('orShift').checked = shiftType === 'Or';
//         document.getElementById('fullShift').checked = shiftType === 'Full';
//         document.getElementById('NoShift').checked = shiftType === 'No';
//     } else {
//         document.getElementById('lunchShift').checked = false;
//         document.getElementById('dinnerShift').checked = false;
//         document.getElementById('orShift').checked = false;
//         document.getElementById('fullShift').checked = false;
//         document.getElementById('NoShift').checked = false;
//     }

//     shiftSelectModal.style.display = 'block';
//     console.log("Modal is now displayed.");
// }

// function closeShiftModal() {
//     shiftSelectModal.style.display = 'none';
// }



// async function saveShift(date,  shiftType) {
//     const url = '/shift_form/';  // DjangoのビューにPOSTするURL
//     const data = { date,  shift_type: shiftType };

//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': csrfToken, // CSRFトークンをヘッダーに追加
//             },
//             body: JSON.stringify(data),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to save shift');
//         }

//         // 追記：結果をJSONで受け取りエラーハンドリング
//         const result = await response.json();
//         if (result.status !== 'success') {
//             throw new Error(result.message || 'Failed to save shift');
//         }

//         console.log('Shift saved successfully'); 
//         // shifts[date] = shifts[date] || [];
//         shifts[date] = { shift_type: shiftType }; //シフトデータを更新
//         generateShiftTable(currentDate.getFullYear(), currentDate.getMonth()); // カレンダーを再描画
//         closeShiftModal();
//     } catch (error) {
//         console.error('Error saving shift:', error);
//     }
// }





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
            // const shiftData = shifts[formattedDate]?.find(s => s.user === account.account_id);
            // const shiftSymbol = getShiftSymbol(shiftData?.shift_type);
            const shiftType = shiftData?shiftData.shift_type : '';
            // tableHtml += `<td class="shift_symbol">${shiftSymbol}</td>`;
            tableHtml += `<td class="shift_symbol" onclick="openShiftModal(new Date(${year}, ${month}, ${i}))">${shiftType}</td>`;
        });

                    

        tableHtml += '<onclick="openShiftModal(new Date(${year}, ${month}, ${i}))" /tr>';
        
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
    await Promise.all([fetchAccounts(), fetchShifts()]);
    generateShiftTable(currentDate.getFullYear(), currentDate.getMonth());
}

// 初期設定
// fetchShifts();
document.addEventListener('DOMContentLoaded', initializeData);