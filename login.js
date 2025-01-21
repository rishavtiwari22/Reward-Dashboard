let ADMIN = 'http://localhost:3000/api';

async function fetchRecords() {
  const response = await fetch(`${ADMIN}/getAll`);
  const data = await response.json();
  console.log('Mongo data -', data);
  return data;
}
fetchRecords();


async function createRecord(name, email, password, isAdmin) {

  const response = await fetch(`${ADMIN}/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name, email, password, isAdmin}),
  }).catch(err => {
    console.error('Fetch error:', err);
  });
  
  if (!response.ok) {
    console.error('Response error:', response.statusText);
    return;
  }
  
  const data = await response.json();
  localStorage.setItem('user', JSON.stringify({ name, email, password, isAdmin }));
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

  localStorage.setItem('user', JSON.stringify({ name: data[index].name, email: data[index].email, password: data[index].password, isAdmin: data[index].isAdmin }));
  if (user) {
    window.location.href = 'main.html';
  } else {
    alert('User not exist!');
  }

});
