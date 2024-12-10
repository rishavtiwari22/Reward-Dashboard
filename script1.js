// API Configurations
const SHEET_API_READ = "https://api.sheetbest.com/sheets/ba34976c-1fa7-4274-91bd-af7a37ee89a5"; 
const SHEET_API_WRITE = "https://api.sheetbest.com/sheets/ba34976c-1fa7-4274-91bd-af7a37ee89a5";

// Elements
const dashboardSection = document.getElementById('dashboard-section');
const addExpenseSection = document.getElementById('add-expense-section');
const manageAdminsSection = document.getElementById('manage-admins-section');

const totalCampusesEl = document.getElementById('total-campuses');
const totalExpensesEl = document.getElementById('total-expenses');
const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.getElementById('expense-table-body');

// Data
let expenses = [];

// Fetch Expenses from Sheet API
async function fetchExpensesFromSheet() {
    try {
        const response = await fetch(SHEET_API_READ);
        if (!response.ok) throw new Error(`Failed to fetch data`);
        const data = await response.json();

        // Map response to expenses array with IDs
        expenses = data.map(exp => ({
            id: exp.id || Math.random().toString(36).substr(2, 9), 
            campus: exp.Campus || "Unknown Campus",
            house: exp.House || "Unknown House",
            point: parseFloat(exp.Point) || 0,
            rewards: exp.Rewards || '',
            amount: parseFloat(exp.Amount) || 0,
            date: exp.Date || '',
        }));

        renderExpenseTable();
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

// Render Expense Table with Edit/Delete buttons
function renderExpenseTable() {
    expenseTableBody.innerHTML = ''; // Clear table

    expenses.forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.campus}</td>
            <td>${exp.date}</td>
            <td>${exp.house}</td>
            <td>${exp.point}</td>
            <td>${exp.rewards}</td>
            <td>${exp.amount.toFixed(2)}</td>
            <td class="table-btns">
                <button class="edit" onclick="editExpense('${exp.id}')">Edit</button>
                <button class="delete" onclick="deleteExpense('${exp.id}')">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
}

// Edit Functionality
// Edit Functionality - Calls PATCH to send only updated fields
async function editExpense(id) {
  const expenseToEdit = expenses.find(exp => exp.id === id);
  if (!expenseToEdit) return alert("Expense not found!");

  // Populate form fields with current data
  document.getElementById('campus').value = expenseToEdit.campus;
  document.getElementById('house').value = expenseToEdit.house;
  document.getElementById('point').value = expenseToEdit.point;
  document.getElementById('rewards').value = expenseToEdit.rewards;
  document.getElementById('amount').value = expenseToEdit.amount;
  document.getElementById('date').value = expenseToEdit.date;

  // Store expense id in a hidden field for submission later
  expenseForm.setAttribute('data-edit-id', expenseToEdit.id);
}

// Handle Expense Form Submission with PATCH
expenseForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const campus = document.getElementById('campus').value;
  const house = document.getElementById('house').value;
  const point = parseInt(document.getElementById('point').value);
  const rewards = document.getElementById('rewards').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const editId = expenseForm.getAttribute('data-edit-id');

  if (!editId) return alert("Please select an expense to edit");

  // Determine the row index for the PATCH request
  const expenseIndex = expenses.findIndex(exp => exp.id === editId);
  if (expenseIndex === -1) return alert("Expense not found!");

  const rowNumber = expenseIndex + 2; // Adjust index (Google Sheets uses 1-based indexing)

  try {
      const response = await fetch(
          `https://api.sheetbest.com/sheets/cf969697-682a-40e3-bad4-d54803eeeacf/${rowNumber}`,
          {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  Campus: campus,
                  House: house,
                  Point: point,
                  Rewards: rewards,
                  Amount: amount,
                  Date: date,
              }),
          }
      );

      const data = await response.json();
      console.log("Updated row:", data);

      if (!response.ok) throw new Error("Failed to update expense");

      // Update local UI state
      expenses[expenseIndex] = { ...expenses[expenseIndex], campus, house, point, rewards, amount, date };
      renderExpenseTable();
      alert("Expense updated successfully!");
      expenseForm.reset();
      expenseForm.removeAttribute('data-edit-id');
  } catch (error) {
      console.error("Error updating expense:", error);
      alert("Error updating expense!");
  }
});


// Delete Functionality
async function deleteExpense(id) {
  try {
      // Find the index of the expense row
      const expenseIndex = expenses.findIndex(exp => exp.id === id);
      
      if (expenseIndex === -1) {
          alert('Expense not found!');
          return;
      }

      // Row numbers are 0-indexed in Google Sheets, map to 1-indexed row by adding +1
      const rowNumber = expenseIndex + 2; // Sheet rows are 1-indexed, so +1 to adjust

      const response = await fetch(
          `https://api.sheetbest.com/sheets/cf969697-682a-40e3-bad4-d54803eeeacf/${rowNumber}`,
          {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
          }
      );

      const data = await response.json();
      console.log("Response from delete API:", data);

      if (!response.ok) throw new Error("Error deleting row!");

      // Update expenses array and re-render table
      expenses.splice(expenseIndex, 1); // Remove from frontend array
      renderExpenseTable();
      alert("Expense deleted successfully!");
  } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense!");
  }
}


// Handle Expense Form Submission
expenseForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const campus = document.getElementById('campus').value;
    const house = document.getElementById('house').value;
    const point = parseInt(document.getElementById('point').value);
    const rewards = document.getElementById('rewards').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const editId = expenseForm.getAttribute('data-edit-id');

    const newExpense = { campus, house, point, rewards, amount, date };

    if (editId) {
        // Edit existing expense
        const index = expenses.findIndex(exp => exp.id === editId);
        expenses[index] = { ...newExpense, id: editId };
    } else {
        // Create new expense
        newExpense.id = Math.random().toString(36).substr(2, 9);
        expenses.push(newExpense);
    }

    renderExpenseTable();
    expenseForm.reset();
    expenseForm.removeAttribute('data-edit-id');
});

// Initialize Dashboard
fetchExpensesFromSheet();
