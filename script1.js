
let LOGIN_API = "https://login-backend-three.vercel.app/api";
let DATA_API = "https://data-backend-phi.vercel.app/api";

const dashboardSection = document.getElementById("dashboard-section");
const addExpenseSection = document.getElementById("add-expense-section");
const manageAdminsSection = document.getElementById("manage-admins-section");
const about = JSON.parse(localStorage.getItem('user'));
console.log('About - ', about);

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

async function fetchSheetRecords() {
    const response = await fetch(`${DATA_API}/getAll`);
    const data = await response.json();
    console.log('fetchRecords 100 - ', data);
    return data;
}

async function fetchUser() {
    const response = await fetch(`${LOGIN_API}/getAll`);
    const data = await response.json();
    console.log('fetchRecords 100 - ', data);
    return data;
}


async function addExpenseToSheet(expense) {
    try {
        const currentDate = new Date(expense.date);
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const year = currentDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        console.log('Submitting expense:', {
            campus: expense.campus,
            date: formattedDate,
            house: expense.house,
            point: expense.point,
            rewards: expense.rewards,
            amount: expense.amount
        });

        const allow_user = JSON.parse(localStorage.getItem('user'));
        if (allow_user.isAdmin === 'FALSE') {
            alert('Sorry, You are not an admin!');
            return;
        }

        const response = await fetch(`${DATA_API}/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                campus: expense.campus,
                date: formattedDate,
                house: expense.house,
                point: Number(expense.point),
                rewards: expense.rewards,
                amount: Number(expense.amount)
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            throw new Error(`Failed to save expense. ${errorData.message}`);
        }

        const result = await response.json();
        console.log('Expense added successfully:', result);
        alert('Expense added successfully!');
        await updateDashboard();
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Failed to add the expense. Please try again.');
    }
}


async function updateDashboard() {
    try {
        const expenses = await fetchSheetRecords();
        
        totalCampusesEl.textContent = campuses.length;
        totalExpensesEl.textContent = expenses
            .reduce((sum, exp) => sum + Number(exp.amount), 0)
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
                      <td>${Number(exp.amount).toFixed(2)}</td>
                      <td><button class='edit-btn' onclick="editExpense(${JSON.stringify(
                exp
            ).replace(/"/g, "&quot;")})">Edit</button></td>
                      <td><button class='delete-btn' onclick="deleteExpense(${JSON.stringify(
                exp
            ).replace(/"/g, "&quot;")})">Delete</button></td>
                    </tr>`;

            expenseTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error updating dashboard:', error);
        alert('Error updating dashboard. Please check the console for details.');
    }
}

function editExpense(expense) {
    const updatedCampus = prompt("Edit Campus:", expense.campus) || expense.campus;
    const updatedHouse = prompt("Edit House:", expense.house) || expense.house;
    const updatedPoint = parseFloat(prompt("Edit Point:", expense.point)) || expense.point;
    const updatedRewards = prompt("Edit Rewards:", expense.rewards) || expense.rewards;
    const updatedAmount = parseFloat(prompt("Edit Amount:", expense.amount)) || expense.amount;
    const updatedDate = prompt("Edit Date (DD-MM-YYYY):", expense.date) || expense.date;

    if (confirm("Are you sure you want to save the changes?")) {
        const updatedExpense = {
            campus: updatedCampus,
            date: updatedDate,
            house: updatedHouse,
            point: updatedPoint,
            rewards: updatedRewards,
            amount: updatedAmount
        };
        
        console.log('Updating expense with ID:', expense._id);
        console.log('Updated data:', updatedExpense);
        
        fetch(`${DATA_API}/update/${expense._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedExpense)
        })
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Update failed: ${errorData.message}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Update successful:', data);
            alert('Expense updated successfully!');
            updateDashboard();
        })
        .catch((error) => {
            console.error('Error updating expense:', error);
            alert('Failed to update expense. Please try again.');
        });
    } else {
        console.log("Edit canceled by the user.");
    }
}


async function deleteExpense(expense) {
    try {
        console.log('Index delete - ', expense);
        
        if (!expense || !expense._id) {
            throw new Error('Invalid expense object or missing _id');
        }
        
        const response = await fetch(`${DATA_API}/delete/${expense._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Delete successful:', data);
        await updateDashboard();
        
    } catch (error) {
        console.error('Error deleting expense:', error);
    }
}

expenseForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const campusInput = document.getElementById("campus");
    const houseInput = document.getElementById("house");
    const pointInput = document.getElementById("point");
    const rewardsInput = document.getElementById("rewards");
    const amountInput = document.getElementById("amount");
    const dateInput = document.getElementById("date");

    if (
        !campusInput.value ||
        !houseInput.value ||
        !rewardsInput.value ||
        isNaN(pointInput.value) ||
        isNaN(amountInput.value)
    ) {
        alert("Please fill all fields correctly!");
        return;
    }

    const newExpense = {
        campus: campusInput.value,
        house: houseInput.value,
        point: parseFloat(pointInput.value),
        rewards: rewardsInput.value,
        amount: parseFloat(amountInput.value),
        date: dateInput.value || new Date().toISOString().split('T')[0]
    };

    await addExpenseToSheet(newExpense);
    expenseForm.reset();
    setCurrentDate();
    switchSection(dashboardSection);
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
    updateDashboard();
});

populateHouseDropdown();
updateDashboard();
switchSection(dashboardSection);



// ======================================================================================



const logout = document.getElementById("logout-btn");
logout.addEventListener("click", () => {
    window.location.href = "index.html";
});

const checkAdmin = JSON.parse(localStorage.getItem("user"));
console.log("checkAdmin 1 - ", checkAdmin);
const createAdmin = document.getElementById("add-admin");

const admin_name = document.getElementById('admin-name');
admin_name.innerText = `Welcome, ${checkAdmin.name}`;


createAdmin.addEventListener("click", (e) => {
    e.preventDefault();
    if (checkAdmin.isAdmin === true) {
        const newAdmin = document.getElementById("new-admin").value;
        console.log('newAdmin - ', newAdmin);

        async function getData() {
            const data_admin = await fetchUser();
            console.log('data_admin:', data_admin);

            let findUser;
            for (let i = 0; i < data_admin.length; i++) {
                if (data_admin[i].email === newAdmin && data_admin[i].password) {
                    findUser = i;
                    break;
                }
            }
            console.log("findUser - ",data_admin[findUser]);
            if (data_admin[findUser].isAdmin === true){
                alert('User Already an admin!')
                return;
            }else if (!data_admin[findUser]) {
                alert('User should create account first.')
                return;
            } else {
                alert('Making Admin to user!')
            }
            let userId = data_admin[findUser]._id;
            async function updateAdminStatus(userId) {
                try {
                    if (!userId) {
                        throw new Error('User ID is required');
                    }
            
                    const response = await fetch(`${LOGIN_API}/update/${userId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ isAdmin: true })
                    });
            
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
            
                    const data = await response.json();
                    console.log('Update successful:', data);
                    
                } catch (error) {
                    console.error('Error updating admin status:', error);
                }
            }
            updateAdminStatus(userId);
            // showAdmins();
        }
        getData();
    } else {
        alert('Only Admin can make another Admin! :)')
    }
});


async function showAdmins() {
    const admins = document.getElementById('admins');

    const response_admin = await fetch(`${LOGIN_API}/getAll`);
    const data_admin = await response_admin.json();
    const allAdmins = data_admin.filter(ele => ele.isAdmin === true);
    console.log('allAdmins - ', allAdmins);
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

        const response_admin = await fetch(`${LOGIN_API}/getAll`);
        const data_admin = await response_admin.json();
        const email = e.target.dataset.email;
        console.log('data_admin:', data_admin);
        const userEmail = data_admin.find(ele => (about.email === ele.email && ele.isAdmin === true));
        console.log('userEmail - ', userEmail);

        if (email === 'rishav@navgurukul.org') {
            alert('Nobady can remove this Admin!😂😂')
            return;
        }

        let findUser;
        for (let i = 0; i < data_admin.length; i++) {
            if (data_admin[i].email === email && userEmail) {
                findUser = i;
                break;
            }
        }
        if (!findUser) {
            alert('User not a Admin!')
            return;
        } else {
            alert('Removing Admin!')
        }

        let userId = data_admin[findUser]._id;
        async function updateAdminStatus(userId) {
            try {
                if (!userId) {
                    throw new Error('User ID is required');
                }
        
                const response = await fetch(`${LOGIN_API}/update/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isAdmin: false })
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                const data = await response.json();
                console.log('Update successful:', data);
                
            } catch (error) {
                console.error('Error updating admin status:', error);
            }
        }
        updateAdminStatus(userId);
        showAdmins();
    }
    getData();
})

