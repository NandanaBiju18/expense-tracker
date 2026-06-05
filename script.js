const page = window.location.pathname;

/* ================= LOGIN CHECK ================= */
if (
    !localStorage.getItem("loggedInUser") &&
    !page.includes("login.html") &&
    !page.includes("register.html")
) {
    window.location.href = "login.html";
}

/* ================= GLOBAL CHARTS ================= */
let categoryChart = null;
let allCategoryChart = null;
let yearChart = null;

/* ================= REGISTER ================= */
function register() {
    const user = document.getElementById("newUser").value;
    const pass = document.getElementById("newPass").value;

    if (!user || !pass) return alert("Fill all fields");

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[user]) return alert("User already exists");

    users[user] = pass;

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registered Successfully!");
    window.location = "login.html";
}

/* ================= LOGIN ================= */
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[user] && users[user] === pass) {
        localStorage.setItem("loggedInUser", user);
        window.location = "dashboard.html";
    } else {
        alert("Invalid Username or Password");
    }
}

/* ================= LOGOUT ================= */
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

/* ================= NAVIGATION (OLD SAFE) ================= */
function goToAdd() { window.location = "add.html"; }
function goToMonthly() { window.location = "monthly.html"; }
function goToSavings() { window.location = "savings.html"; }
function back() { window.location = "dashboard.html"; }

/* ================= DATE ================= */
function setToday() {
    const el = document.getElementById("date");
    if (el) el.value = new Date().toISOString().split("T")[0];
}

/* ================= ADD TRANSACTION ================= */
function addTransaction() {

    const user = localStorage.getItem("loggedInUser");
    if (!user) return alert("Login first");

    const text = document.getElementById("text").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    if (!text || !amount || !date) return alert("Fill all fields");

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    transactions.push({
        id: Date.now(),
        text,
        amount: Number(amount),
        date,
        category
    });

    localStorage.setItem("transactions_" + user, JSON.stringify(transactions));

    document.getElementById("text").value = "";
    document.getElementById("amount").value = "";

    displayTransactions();
    displayDashboard();
}

/* ================= DISPLAY TRANSACTIONS (OLD SAFE) ================= */
function displayTransactions() {

    const user = localStorage.getItem("loggedInUser");
    if (!user) return;

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    const list = document.getElementById("list");
    const total = document.getElementById("total");

    if (!list || !total) return;

    list.innerHTML = "";

    let sum = 0;

    transactions.forEach(t => {

        sum += Number(t.amount);

        const li = document.createElement("li");

        li.innerHTML = `
            ${t.text} | ₹${t.amount} | ${t.date} | ${t.category}
            <button onclick="deleteTransaction(${t.id})">❌</button>
        `;

        list.appendChild(li);
    });

    total.innerText = sum;
}

/* ================= DELETE EXPENSE ================= */
function deleteTransaction(id) {

    const user = localStorage.getItem("loggedInUser");

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    transactions = transactions.filter(t => t.id !== id);

    localStorage.setItem("transactions_" + user, JSON.stringify(transactions));

    displayTransactions();
    displayDashboard();
}

/* ================= DASHBOARD (UNCHANGED SAFE) ================= */
function displayDashboard() {

    const user = localStorage.getItem("loggedInUser");
    if (!user) return;

    let savings = Number(localStorage.getItem("savings_" + user)) || 0;

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    let expense = transactions.reduce((a, b) => a + Number(b.amount), 0);

    let balance = savings - expense;

    if (document.getElementById("savings"))
        document.getElementById("savings").innerText = savings;

    if (document.getElementById("expense"))
        document.getElementById("expense").innerText = expense;

    if (document.getElementById("balance"))
        document.getElementById("balance").innerText = balance;
}

function goToNotes() {
    window.location = "notes.html";
}

/* ================= MONTH DROPDOWN ================= */
function loadMonthDropdown() {

    const user = localStorage.getItem("loggedInUser");

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    const months = [...new Set(transactions.map(t => t.date?.slice(0, 7)))].filter(Boolean);

    const select = document.getElementById("monthSelect");
    if (!select) return;

    select.innerHTML = "";

    months.sort().forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        select.appendChild(opt);
    });

    if (months.length > 0) {
        select.value = months[0];
    }
}

/* ================= CATEGORY CHART ================= */
function showCategoryChart() {

    const user = localStorage.getItem("loggedInUser");

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    const month = document.getElementById("monthSelect")?.value;
    if (!month) return;

    const data = {};

    transactions
        .filter(t => t.date && t.date.startsWith(month))
        .forEach(t => {

            const cat = t.category || "Others";
            data[cat] = (data[cat] || 0) + Number(t.amount);
        });

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(document.getElementById("categoryChart"), {
        type: "pie",
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data)
            }]
        }
    });
}

/* ================= ALL CATEGORY CHART ================= */
function showAllCategoryChart() {

    const user = localStorage.getItem("loggedInUser");

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    const data = {};

    transactions.forEach(t => {

        const cat = t.category || "Others";
        data[cat] = (data[cat] || 0) + Number(t.amount);
    });

    if (allCategoryChart) allCategoryChart.destroy();

    allCategoryChart = new Chart(document.getElementById("allCategoryChart"), {
        type: "pie",
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data)
            }]
        }
    });
}

/* ================= YEAR FLOW CHART ================= */
function showYearChart() {

    const user = localStorage.getItem("loggedInUser");

    let transactions =
        JSON.parse(localStorage.getItem("transactions_" + user)) || [];

    const year = new Date().getFullYear();

    const monthly = {};

    transactions.forEach(t => {

        if (!t.date || !t.date.startsWith(year)) return;

        const month = t.date.slice(0, 7);

        monthly[month] =
            (monthly[month] || 0) + Number(t.amount);
    });

    if (yearChart) yearChart.destroy();

    yearChart = new Chart(document.getElementById("yearChart"), {
        type: "bar",
        data: {
            labels: Object.keys(monthly),
            datasets: [{
                label: "Monthly Expense",
                data: Object.values(monthly)
            }]
        }
    });
}

/* ================= SAVINGS (UNCHANGED + SAFE) ================= */
function displaySavings() {
    const user = localStorage.getItem("loggedInUser");
    let savings = Number(localStorage.getItem("savings_" + user)) || 0;

    const el = document.getElementById("currentSavings");
    if (el) el.innerText = savings;
}

function increaseSavings() {
    const user = localStorage.getItem("loggedInUser");
    const amt = document.getElementById("savingAmount").value;

    if (!amt) return alert("Enter amount");

    let savings = Number(localStorage.getItem("savings_" + user)) || 0;
    savings += Number(amt);

    localStorage.setItem("savings_" + user, savings);

    displaySavings();
}

function decreaseSavings() {
    const user = localStorage.getItem("loggedInUser");
    const amt = document.getElementById("savingAmount").value;

    if (!amt) return alert("Enter amount");

    let savings = Number(localStorage.getItem("savings_" + user)) || 0;
    savings -= Number(amt);

    if (savings < 0) savings = 0;

    localStorage.setItem("savings_" + user, savings);

    displaySavings();
}

/* ================= NOTES ================= */

function addNote() {

    const user = localStorage.getItem("loggedInUser");

    if (!user) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const text = document.getElementById("noteInput").value;

    if (!text) return alert("Enter note");

    let notes = JSON.parse(localStorage.getItem("notes_" + user)) || [];

    notes.push({
        id: Date.now(),
        text: text
    });

    localStorage.setItem("notes_" + user, JSON.stringify(notes));

    document.getElementById("noteInput").value = "";

    displayNotes();
}
function displayNotes() {

    const user = localStorage.getItem("loggedInUser");

    if (!user) return;

    let notes = JSON.parse(localStorage.getItem("notes_" + user)) || [];

    const list = document.getElementById("noteList");
    if (!list) return;

    list.innerHTML = "";

    notes.forEach(n => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${n.text}
            <button onclick="deleteNote(${n.id})">❌</button>
        `;

        list.appendChild(li);
    });
}

function deleteNote(id) {

    const user = localStorage.getItem("loggedInUser");

    let notes = JSON.parse(localStorage.getItem("notes_" + user)) || [];

    notes = notes.filter(n => n.id !== id);

    localStorage.setItem("notes_" + user, JSON.stringify(notes));

    displayNotes();
}

/* ================= PAGE LOADER ================= */
document.addEventListener("DOMContentLoaded", function () {

    if (page.includes("add.html")) {
        displayTransactions();
        setToday();
    }

    if (page.includes("dashboard.html")) {
        displayDashboard();
    }

    if (page.includes("monthly.html")) {
        loadMonthDropdown();

        setTimeout(() => {
            showCategoryChart();
            showAllCategoryChart();
            showYearChart();
        }, 200);
    }

    if (page.includes("savings.html")) {
        displaySavings();
    }

    if (page.includes("notes.html")) {
    displayNotes();
}
});