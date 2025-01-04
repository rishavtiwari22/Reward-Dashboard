const SHEET_API_READ = window.config.SHEET_API;
const dashboardSection = document.getElementById("dashboard-section");
const addExpenseSection = document.getElementById("add-expense-section");
const manageAdminsSection = document.getElementById("manage-admins-section");
const about = JSON.parse(localStorage.getItem('user'));

const buttons = {
  dashboard: document.getElementById("dashboard-btn"),
  addExpense: document.getElementById("add-expense-btn"),
  manageAdmins: document.getElementById("manage-admins-btn"),
  logout: document.getElementById("logout-btn"),
};

const totalCampusesEl = document.getElementById("total-campuses");
const totalExpensesEl = document.getElementById("total-expenses");
const totalPointsEl = document.getElementById("total-points");
const expenseForm = document.getElementById("expense-form");
const expenseTableBody = document.getElementById("expense-table-body");

let campuses = [
  "Jashpur",
  "Dharmashala",
  "Raipur",
  "Pune",
  "Dantewada",
  "Udaipur",
  "Sarjapur",
  "Himachal",
  "Kisanganj",
];
let expenses = [];
let houses = ["Bhairav", "Malhar", "Bageshree"];

function switchSection(section) {
  [dashboardSection, addExpenseSection, manageAdminsSection].forEach((sec) =>
    sec.classList.add("hidden")
  );
  section.classList.remove("hidden");
}

function setCurrentDate() {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
}

async function fetchExpensesFromSheet() {
  try {
    const response = await fetch('https://api.sheetbest.com/sheets/ba34976c-1fa7-4274-91bd-af7a37ee89a5/tabs/Expenses ');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    console.log("data - ", data);
    expenses = data.map((exp, index) => ({
      index,
      campus: exp.Campus || "Unknown",
      house: exp.House || "Unknown",
      point: exp.Points || 0,
      rewards: exp.Rewards || "",
      amount: parseFloat(exp.Amount) || 0,
      date: exp.Date || "N/A",
    }));

    updateDashboard();
  } catch (error) {
    console.error("Error fetching expenses:", error);
    alert("Unable to fetch data. Please check the console for more details.");
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
      Date: expense.date,
    };
    const allow_user = JSON.parse(localStorage.getItem('user'));
    console.log('allow_user.isAdmin - ',allow_user.isAdmin);
    
    if (allow_user.isAdmin === 'FALSE'){
      alert('Sorry, You are not admin!')
      return;
    }

    const response = await fetch(SHEET_API_READ, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([formattedExpense]),
    });

    if (!response.ok) throw new Error("Failed to save expense");

    alert("Expense added successfully!");
    await fetchExpensesFromSheet();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to add the expense!");
  }
}

async function updateExpenseInSheet(expense, index) {
  try {
    const formattedExpense = {
      Campus: expense.campus,
      House: expense.house,
      Points: expense.point,
      Rewards: expense.rewards,
      Amount: expense.amount.toFixed(2),
      Date: expense.date,
    };

    const response = await fetch(`${SHEET_API_READ}/${index}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedExpense),
    });

    if (!response.ok) throw new Error("Failed to update expense");

    alert("Expense updated successfully!");
    await fetchExpensesFromSheet();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to update the expense!");
  }
}

async function deleteExpenseFromSheet(index) {
  try {
    const response = await fetch(`${SHEET_API_READ}/${index}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete expense");

    alert("Expense deleted successfully!");
    await fetchExpensesFromSheet();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to delete the expense!");
  }
}

function updateDashboard() {
  totalCampusesEl.textContent = campuses.length;
  totalExpensesEl.textContent = expenses
    .reduce((sum, exp) => sum + exp.amount, 0)
    .toFixed(2);

  totalPointsEl.textContent = expenses.reduce(
    (sum, exp) => sum + Number(exp.point),
    0
  );

  expenseTableBody.innerHTML = "";

  expenses.forEach((exp) => {
    const row = `<tr>
                  <td>${exp.campus}</td>
                  <td>${exp.date}</td>
                  <td>${exp.house}</td>
                  <td>${exp.point}</td>
                  <td>${exp.rewards}</td>
                  <td>${exp.amount.toFixed(2)}</td>
                  <td><button class='edit-btn' onclick="editExpense(${JSON.stringify(
      exp
    ).replace(/"/g, "&quot;")})">Edit</button></td>
                  <td><button class='delete-btn' onclick="deleteExpenseFromSheet(${exp.index
      })">Delete</button></td>
                </tr>`;

    expenseTableBody.innerHTML += row;
  });
}

function editExpense(expense) {
  const updatedCampus =
    prompt("Edit Campus:", expense.campus) || expense.campus;
  const updatedHouse = prompt("Edit House:", expense.house) || expense.house;
  const updatedPoint =
    parseFloat(prompt("Edit Point:", expense.point)) || expense.point;
  const updatedRewards =
    prompt("Edit Rewards:", expense.rewards) || expense.rewards;
  const updatedAmount =
    parseFloat(prompt("Edit Amount:", expense.amount)) || expense.amount;
  const updatedDate =
    prompt("Edit Date (YYYY-MM-DD):", expense.date) || expense.date;

  if (confirm("Are you sure you want to save the changes?")) {
    const index = expense.index;
    const updatedExpense = {
      campus: updatedCampus,
      house: updatedHouse,
      point: updatedPoint,
      rewards: updatedRewards,
      amount: updatedAmount,
      date: updatedDate,
    };

    updateExpenseInSheet(updatedExpense, index);

    fetchExpensesFromSheet();
  } else {
    console.log("Edit canceled by the user.");
  }
}

expenseForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const campusInput = document.getElementById("campus");
  const houseInput = document.getElementById("house");
  const pointInput = document.getElementById("point");
  const rewardsInput = document.getElementById("rewards");
  const amountInput = document.getElementById("amount");

  if (
    !campusInput.value ||
    !houseInput.value ||
    isNaN(pointInput.value) ||
    isNaN(amountInput.value)
  ) {
    alert("Please fill all fields correctly!");
    return;
  }

  const campus = campusInput.value;
  const house = houseInput.value;
  const point = parseFloat(pointInput.value);
  const rewards = rewardsInput.value;
  const amount = parseFloat(amountInput.value);
  const dateInput = document.getElementById("date").value;

  const newExpense = { campus, house, point, rewards, amount, date: dateInput };

  if (expenseForm.dataset.editingIndex !== undefined) {
    await updateExpenseInSheet(
      newExpense,
      parseInt(expenseForm.dataset.editingIndex)
    );
    delete expenseForm.dataset.editingIndex;
    setCurrentDate();
    expenseForm.reset();
  } else {
    await addExpenseToSheet(newExpense);
  }
});

function populateHouseDropdown() {
  const houseSelect = document.getElementById("house");

  if (!houseSelect) return;

  houseSelect.innerHTML = "";

  houses.forEach((house) => {
    const option = document.createElement("option");
    option.value = house;
    option.textContent = house;
    houseSelect.appendChild(option);
  });
}

buttons.dashboard?.addEventListener("click", () =>
  switchSection(dashboardSection)
);
buttons.addExpense?.addEventListener("click", () => {
  switchSection(addExpenseSection);
  setCurrentDate();
});
buttons.manageAdmins?.addEventListener("click", async () => {
  switchSection(manageAdminsSection);
  await fetchExpensesFromSheet();
});

populateHouseDropdown();
fetchExpensesFromSheet();
switchSection(dashboardSection);




// ======================================================================================



const logout = document.getElementById("logout-btn");
logout.addEventListener("click", () => {
  window.location.href = "login.html";
  // window.location.reload();
});

const checkAdmin = JSON.parse(localStorage.getItem("user"));
console.log("checkAdmin 1 - ", checkAdmin);
const createAdmin = document.getElementById("add-admin");


createAdmin.addEventListener("click", (e) => {
  if (checkAdmin.isAdmin === 'TRUE') {
    const newAdmin = document.getElementById("new-admin").value;
    console.log('newAdmin - ', newAdmin);


    e.preventDefault();

    async function getData() {

      const response_admin = await fetch('https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin');
      const data_admin = await response_admin.json();
      console.log('data_admin:', data_admin);

      let findUser;
      
      for (let i = 0; i < data_admin.length; i++) {
        if (data_admin[i].email === newAdmin && data_admin[i].password) {
          findUser = i;
          break;
        }
      }
      if (!findUser){
        alert('User should create account first.')
        return;
      }else{
        alert('Making Admin to user!')
      }

      fetch(`https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin/${findUser}`, {
        method: "PATCH",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAdmin: "true",
        }),
      })
        .then((r) => r.json())
        .then(console.log)
        .catch(console.error);
        showAdmins();
    }

    getData();

  } else {
    alert('Only Admin can make another Admin! :)')
  }
});


async function showAdmins() {
  const admins = document.getElementById('admins');

  const response_admin = await fetch('https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin');
  const data_admin = await response_admin.json();
  const allAdmins = data_admin.filter(ele => ele.isAdmin === 'TRUE');
  console.log('allAdmins - ',allAdmins);
  admins.innerHTML = '';
  allAdmins.reverse()
  const rishav = allAdmins.filter(ele => ele.email !== 'rishav@navgurukul.org' ? ele : '')
  console.log('rishav -', rishav);
  
  admins.innerHTML = '<li>rishav@navgurukul.org</li>';
  rishav.map(ele => {
    admins.innerHTML += `<li>${ele.email}
    <button id="remove-admin" data-email="${ele.email}">Remove</button>
    </li>`
  })
}
showAdmins();




const remove_admin = document.getElementById('admins');

remove_admin.addEventListener('click', (e) => {
  console.log(e.target.dataset.email);
  async function getData() {

    const response_admin = await fetch('https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin');
    const data_admin = await response_admin.json();
    const email = e.target.dataset.email;
    console.log('data_admin:', data_admin);
    const userEmail = data_admin.map(ele => (about.email === ele.email && ele.isAdmin === 'TRUE'));
    console.log('userEmail - ', userEmail);
    

    if (email === 'rishav@navgurukul.org'){
      alert('Nobady can remove this Admin!')
      return;
    }

    let findUser;
    for (let i = 0; i < data_admin.length; i++) {
      if (data_admin[i].email === email && userEmail.includes(true)) {
        findUser = i;
        break;
      }
    }
    if (!findUser){
      alert('User not a Admin!')
      return;
    }else{
      alert('Removing Admin!')
    }

    fetch(`https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin/${findUser}`, {
      method: "PATCH",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isAdmin: "false",
      }),
    })
      .then((r) => r.json())
      .then(console.log)
      .catch(console.error);
      showAdmins();
  }

  getData();
  
})


const admin_name = document.getElementById('admin-name');
console.log('About - ',about);
admin_name.innerText = `Welcome, ${about.fullName}`;


