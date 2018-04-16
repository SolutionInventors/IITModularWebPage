function setCookie(cookieName, value, days) {
    if (days === undefined) {
        document.cookie = `${cookieName}= ${value} ; path =/ `;
    } else {
        let date = new Date(); 
        date.setDate(date.getDate() + (days * 24 * 60 * 60 * 60));
        document.cookie = `${cookieName}= ${value} ; expires = ${date.toUTCString} ; path =/ `;

    }
    
}

function getCookie(cookieName) {
    let name = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieArr = decodedCookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) {
        let c = cookieArr[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    return getCookie("username") != ""; 
}




function openTab(tabName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontents = document.getElementsByClassName("tabcontent");
    for (let tabcontent of tabcontents) {
        tabcontent.style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (let tablink of tablinks) {
        tablink.className = tablink.className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab

    document.getElementById(tabName).style.display = "block";

    if (tabName == 'experience') {
        document.getElementById('experience').style.display = "block";
    }
    document.getElementById(tabName + '-button').className += " active";
}

function unescapeHTML(str) {
    str = unescape(str);
    while (str.lastIndexOf('<') >= 0 || str.lastIndexOf('>') >= 0) {
        str = str.replace("<", "&lt;");
        str = str.replace(">", "&gt;")
    }
    return str;
}

function verifyInputs(parentID, highlight = true, innerHTML = "Some required fields marked <em>*</em> are missing") {
    let textInputs = document.getElementById(parentID).querySelectorAll('input, textarea');

    let missingFields = false;
    for (let inputText of textInputs) {

        if (inputText.value == "" && !inputText.hidden) {
            missingFields = true;
            if (highlight) inputText.style.boxShadow = '0 0 4px red';

        } else {
            inputText.style.boxShadow = '';
        }
    }
    if (missingFields && highlight) {
        document.getElementById('requiredList').style.display = 'block';
        document.getElementById('requiredList').innerHTML = innerHTML; 
    } else {
        document.getElementById('requiredList').style.display = 'none';
    }

    return !missingFields;

}

function clearInputs(parentID, highlight = true) {
    let textInputs = document.getElementById(parentID).querySelectorAll('input[type =text], textarea, input[type =number]');

    for (let inputText of textInputs) {
        
        inputText.value = "";
    }

}


function getDateStr(date) {
    let day = date.getDate();
    day = +day >= 10 ? day : "0" + day;
    let month = date.getMonth() + 1;
    month = +month >= 10 ? month : "0" + month;
    let year = date.getFullYear();
    return day + "-" + month + "-" + year;
}

/**
 * Returns a string with no space in it
 * @param {any} str
 */
function removeAllSpaces(str) {
    return str.replace(/\s/g, ""); 
}
