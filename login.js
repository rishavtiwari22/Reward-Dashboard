
async function fetchData() {
    const fetchResponse = await fetch(`https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin`);
    const fetchData = await fetchResponse.json();
    return fetchData;
}


document.querySelector("#signupBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    const form1 = document.getElementById("form1");
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const termsAccepted = document.querySelector("#signupCheck").checked;

    if (!termsAccepted) {
        alert("Please accept the terms and conditions.");
        return;
    }

    const signupData = {
        fullName: username,
        email: email,
        password: password,
        isAdmin: 'false',
    };    

    console.log('signupData - ', signupData);
    

    const verifyEmails = await fetchData();
    const allEmails = verifyEmails.map(ele => ele.email === email);
    console.log('allEmails - ', allEmails);
    
    if (allEmails.includes(true)) {
        alert('User already exist!')
        return;
    }

    if (!signupData.fullName || !signupData.email || !signupData.password) {
        alert("Please enter all the details");
        return;
    }

    localStorage.setItem('user', JSON.stringify(signupData));
    console.log('signupData stored in local storage - ', signupData);

    try {
        const response = await fetch("https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(signupData),
        });
        const result = await response.json();
        
        if (response.ok) {
            alert("Signup successful!");
            form1.reset();
            window.location.href = 'main.html';
        } else {
            alert(`Signup failed: ${result.message}`);
        }
    } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred. Please try again.");
    }
});












// ================================= Login ==============================


document.querySelector("#loginBtn").addEventListener("click", async (e) => {
    const form2 = document.getElementById("form2");
    const adminCheck = document.querySelector("#adminCheck").checked;
    const email = document.querySelector("#loginEmail").value;
    const password = document.querySelector("#loginPassword").value;

    if (!email || !password) {
        alert("Please fill in both email and password.");
        return;
    }
    try {
        const response = await fetch(`https://api.sheetbest.com/sheets/83ddcbba-afe9-4a97-8201-f3c1c5740e97/tabs/Admin`)
        const data = await response.json();

        let findUser;
        for(let i = 0; i < data.length; i++){
            if(data[i].email === email && data[i].password === password){
                findUser = data[i];
                break;
            }
        }   
        localStorage.setItem('user', JSON.stringify(findUser));

        if (findUser) {
            alert("Login successful!");
            window.location.href = 'main.html';
        } else {
            alert('User not found!')
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
    }
});


