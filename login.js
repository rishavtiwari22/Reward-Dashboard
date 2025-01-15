let API_URL = 'https://script.google.com/macros/s/AKfycbwpN5jcuFhW1zXp5ViDPADi1oSO_KjYQ8tw7V3H8XGQ4tw8h0y3wmidIaeR7G5B18pk/exec';


async function fetchRecords() {
  const response = await fetch(`${API_URL}?action=read`, {
    method: "GET",
  });

  const data = await response.json();
  console.log('fetchRecords - ', data);
  return data;
}
fetchRecords();


async function createRecord(fullName, email, password, isAdmin) {
  const response = await fetch(API_URL, {
    method: "POST",
    mode: 'no-cors',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "create",
      fullName: fullName,
      email: email,
      password: password,
      isAdmin: isAdmin,
    }),
  });

  const result = await response.text();
  console.log(result);
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
  const allEmails = verifyEmails.map(ele => ele.email === email);

  if (allEmails.includes(true)) {
    alert('User already exist!')
    return;
  }

  if (!username || !email || !password) {
    alert("Please enter all the details");
    return;
  }

  createRecord(username, email, password, false);
  localStorage.setItem('user', JSON.stringify({ username, email, password, isAdmin: false }));
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
    username:data[index].fullName,
    email:data[index].email,
    password:data[index].password, 
    isAdmin:data[index].isAdmin
  }

  localStorage.setItem('user', JSON.stringify(obj));
  console.log('User :', user);
  
  if (user) {
    window.location.href = 'main.html';
  } else {
    alert('User not exist!');
  }

});
