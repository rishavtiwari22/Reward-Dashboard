let API_URL = 'https://script.google.com/macros/s/AKfycbyjhSh7ByLSW27Kgk3JL4nn8kolbEYfY9yrF5HYrUrijDFxm_TETY7SIHiC7YTtUyg/exec';
let ADMIN = 'https://sheetdb.io/api/v1/4jddbeyi3ewy8';

async function fetchRecords() {
  const response = await fetch(`${ADMIN}`);
  const data = await response.json();
  console.log('Admin data -', data);
  return data;
}
fetchRecords();


async function createRecord(fullName, email, password, isAdmin) {

  let obj = {
    fullName:	fullName,
    email:	email,
    password: password,	
    isAdmin: isAdmin,
  }

  const response = await fetch(`${ADMIN}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: [obj] }),
  }).catch(err => {
    console.error('Fetch error:', err);
  });
  
  if (!response.ok) {
    console.error('Response error:', response.statusText);
    return;
  }
  
  const data = await response.json();
  console.log('Response data:', data);
  return data;
  
}


document.querySelector("#signupBtn").addEventListener("click", async (e) => {

  e.preventDefault();
  const username = document.querySelector("#username").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  const termsAccepted = document.querySelector("#signupCheck").checked;

  if (!termsAccepted) {
    alert("Please accept the terms and conditions.");
    return;
  }

  const verifyEmails = await fetchRecords();
  console.log('verifyEmails - ', verifyEmails);
  
  const allEmails = verifyEmails.map(ele => ele.email === email);

  if (allEmails.includes(true)) {
    alert('User already exist!')
    return;
  }
  if (!username || !email || !password) {
    alert("Please enter all the details");
    return;
  }
  alert('User created successfully!');
  let isAdmin = "false";
  await createRecord(username, email, password, isAdmin);
  localStorage.setItem('user', JSON.stringify({ username, email, password, isAdmin: false}));
  fetchRecords();
  window.location.href = 'main.html';
});


// ================================= Login - 1 ==============================


document.getElementById('loginBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const data = await fetchRecords();
  const email = document.querySelector("#loginEmail").value;
  const password = document.querySelector("#loginPassword").value;

  if (!email || !password) {
    alert('Enter user data!');
    return;
  }

  let user = false;
  let index = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].email.trim() === email.trim() && data[i].password.toString() === password.toString()) {
      user = true;
      console.log(data[i]);
      index = i;
      break;
    }
  }
  console.log('data[index] - ', data[index]);

  const obj = {
    username: data[index].fullName,
    email: data[index].email,
    password: data[index].password,
    isAdmin: data[index].isAdmin
  }

  localStorage.setItem('user', JSON.stringify(obj));
  console.log('User :', user);

  if (user) {
    window.location.href = 'main.html';
  } else {
    alert('User not exist!');
  }

});
