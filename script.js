const SHEET_API_READ = window.config.SHEET_API

const dashboardSection = document.getElementById('dashboard-section');
const addExpenseSection = document.getElementById('add-expense-section');
const manageAdminsSection = document.getElementById('manage-admins-section');

const buttons = {
    dashboard: document.getElementById('dashboard-btn'),
    addExpense: document.getElementById('add-expense-btn'),
    manageAdmins: document.getElementById('manage-admins-btn'),
    logout: document.getElementById('logout-btn'),
};

const totalCampusesEl = document.getElementById('total-campuses');
const totalExpensesEl = document.getElementById('total-expenses');
const totalPointsEl = document.getElementById('total-points');
const expenseForm = document.getElementById('expense-form');
const adminForm = document.getElementById('admin-form');
const adminsList = document.getElementById('admins');
const expenseTableBody = document.getElementById('expense-table-body');

let campuses = ['Jashpur', 'Dharmashala', 'Raipur', 'Pune', 'Dantewada', 'Udaipur', 'Sarjapur', 'Himachal', 'Kisanganj'];
let expenses = [];
let admins = ['admin@example.com'];
let houses = ['Bhairav', 'Malhar', 'Bageshree'];

function switchSection(section) {
    [dashboardSection, addExpenseSection, manageAdminsSection].forEach(sec => sec.classList.add('hidden'));
    section.classList.remove('hidden');
}

function setCurrentDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

async function fetchExpensesFromSheet() {
    try {
        const response = await fetch(SHEET_API_READ);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
        const data = await response.json();

        expenses = data.map(exp => ({
            campus: exp.Campus || "Unknown Campus",
            house: exp.House || "Unknown House",
            point: exp.Points || 0,
            rewards: exp.Rewards || '',
            amount: parseFloat(exp.Amount) || 0,
            date: exp.Date || 'N/A',
        }));
        updateDashboard();
    } catch (error) {
        console.error("Error fetching expenses:", error);
        alert("Error fetching expenses!");
    }
}

async function addExpenseToSheet(expense) {
    try {
        const formattedExpense = {
            Campus: expense.campus,
            House: expense.house,
            Points: expense.point,
            Rewards: expense.rewards,
            Amount: expense.amount.toFixed(2),
            Date: new Date().toISOString().split('T')[0],
        };
        

        const response = await fetch(SHEET_API_READ, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([formattedExpense]),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Failed to add expense: ${response.status} - ${errorDetails}`);
        }

        alert("Expense added successfully!");
        await fetchExpensesFromSheet();
    } catch (error) {
        console.error("Error adding expense:", error);
        alert("Error adding expense! Please check console for details.");
    }
}

function updateDashboard() {
    totalCampusesEl.textContent = campuses.length;
    totalExpensesEl.textContent = expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2);
    totalPointsEl.textContent = expenses.reduce((sum, exp) => sum + Number(exp.point), 0);
    expenseTableBody.innerHTML = '';
    
    expenses.forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.campus}</td>
            <td>${exp.date}</td>
            <td>${exp.house}</td>
            <td>${exp.point}</td>
            <td>${exp.rewards}</td>
            <td>${exp.amount.toFixed(2)}</td>
        `;
        expenseTableBody.appendChild(row);
    });
}

expenseForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const campus = document.getElementById('campus').value;
    const house = document.getElementById('house').value;
    const point = parseFloat(document.getElementById('point').value);
    const rewards = document.getElementById('rewards').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const dateInput = document.getElementById('date').value;
    const date = dateInput || new Date().toISOString().split('T')[0];

    if (!campus || !house || isNaN(point) || isNaN(amount) || !date) {
        alert('Please fill in all fields correctly!');
        return;
    }

    const newExpense = { campus, house, point, rewards, amount, date };
    await addExpenseToSheet(newExpense);
    expenseForm.reset();
    setCurrentDate();
});

function populateHouseDropdown() {
    const houseSelect = document.getElementById('house');
    if (!houseSelect) return;
    houseSelect.innerHTML = '';
    houses.forEach(house => {
        const option = document.createElement('option');
        option.value = house;
        option.textContent = house;
        houseSelect.appendChild(option);
    });
}

buttons.dashboard?.addEventListener('click', () => switchSection(dashboardSection));
buttons.addExpense?.addEventListener('click', () => {
    switchSection(addExpenseSection);
    setCurrentDate();
});
buttons.manageAdmins?.addEventListener('click', () => switchSection(manageAdminsSection));

populateHouseDropdown();
fetchExpensesFromSheet();
switchSection(dashboardSection);
