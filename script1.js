// let currentPage = 1;
// let rowsPerPage = 10;
// let searchQuery = "";
// let sortColumn = null;
// let sortOrder = "asc";

// const SHEET_API_READ = window.config.SHEET_API;
// const expenseTableBody = document.getElementById("expense-table-body");
// const searchBar = document.getElementById("search-bar");
// const rowsPerPageSelect = document.getElementById("rows-per-page");
// const paginationControls = document.getElementById("pagination-controls");
// const sortButtons = document.querySelectorAll(".sort-btn");

// async function fetchExpensesFromSheet() {
//     try {
//         const response = await fetch(SHEET_API_READ);
//         if (!response.ok) throw new Error(`Error: ${response.status}`);
//         const data = await response.json();
//         console.log('data - ',data);
        
//         expenses = data.map((exp, index) => ({
//             index,
//             campus: exp.Campus || "Unknown",
//             house: exp.House || "Unknown",
//             point: Number(exp.Points) || 0,
//             rewards: exp.Rewards || "",
//             amount: parseFloat(exp.Amount) || 0,
//             date: exp.Date || "N/A",
//         }));
//         renderTable();
//     } catch (error) {
//         console.error("Error fetching expenses:", error);
//         alert("Unable to fetch data. Please check the console for more details.");
//     }
// }

// function applySearchAndSort() {
//     let filteredExpenses = expenses.filter((exp) =>
//         Object.values(exp).some((val) => val.toString().toLowerCase().includes(searchQuery.toLowerCase()))
//     );

//     if (sortColumn) {
//         filteredExpenses.sort((a, b) => {
//             if (sortOrder === "asc") return a[sortColumn] > b[sortColumn] ? 1 : -1;
//             return a[sortColumn] < b[sortColumn] ? 1 : -1;
//         });
//     }

//     return filteredExpenses;
// }

// function paginateData(filteredExpenses) {
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     return filteredExpenses.slice(startIndex, startIndex + rowsPerPage);
// }

// function renderTable() {
//     const filteredExpenses = applySearchAndSort();
//     const paginatedExpenses = paginateData(filteredExpenses);

//     expenseTableBody.innerHTML = paginatedExpenses
//         .map(
//             (exp) => `
//             <tr>
//                 <td>${exp.campus}</td>
//                 <td>${exp.date}</td>
//                 <td>${exp.house}</td>
//                 <td>${exp.point}</td>
//                 <td>${exp.rewards}</td>
//                 <td>${exp.amount.toFixed(2)}</td>
//                 <td><button onclick="editExpense(${exp.index})">Edit</button></td>
//                 <td><button onclick="deleteExpense(${exp.index})">Delete</button></td>
//             </tr>`
//         )
//         .join("");

//     renderPagination(filteredExpenses.length);
// }

// function renderPagination(totalRows) {
//     const totalPages = Math.ceil(totalRows / rowsPerPage);
//     paginationControls.innerHTML = "";

//     for (let i = 1; i <= totalPages; i++) {
//         const btn = document.createElement("button");
//         btn.textContent = i;
//         if (i === currentPage) btn.classList.add("active");
//         btn.addEventListener("click", () => {
//             currentPage = i;
//             renderTable();
//         });
//         paginationControls.appendChild(btn);
//     }
// }

// searchBar.addEventListener("input", (e) => {
//     searchQuery = e.target.value;
//     renderTable();
// });

// rowsPerPageSelect.addEventListener("change", (e) => {
//     rowsPerPage = Number(e.target.value);
//     currentPage = 1;
//     renderTable();
// });

// sortButtons.forEach((btn) =>
//     btn.addEventListener("click", (e) => {
//         const column = e.target.dataset.column;
//         if (sortColumn === column) {
//             sortOrder = sortOrder === "asc" ? "desc" : "asc";
//         } else {
//             sortColumn = column;
//             sortOrder = "asc";
//         }
//         renderTable();
//     })
// );

// fetchExpensesFromSheet();


