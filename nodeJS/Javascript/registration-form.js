let student = {
    education: [],
    experience: [],
    means: [],
    fixedData: {},
};

let educationMap = new Map();
let expMap = new Map();
let howYouHeard = new Set(); 


function createPersonalData() {
    if (!verifyInputs('personal-data')) return;


    let firstName = unescapeHTML(document.getElementById('firstName').value);
    let lastName = unescapeHTML(document.getElementById('lastName').value);
    let title = unescapeHTML(document.getElementById('title').value);
    let placeOfBirth = unescapeHTML(document.getElementById('pob').value); //place of brth
    // let religion  = document.getElementById('religion').value; 
    let phone = document.getElementById('phone').value;
    let emailAddress = unescapeHTML(document.getElementById('email').value);
    let currentAddress = unescapeHTML(document.getElementById('current-address').value);
    let permanentAddress = unescapeHTML(document.getElementById('permanent-address').value);

    let dobDay = document.getElementById('dob-day').value;
    let dobMonth = document.getElementById('dob-month').value;
    let dobYear = document.getElementById('dob-year').value;

    let dateOfBirth = new Date(dobYear, dobMonth, dobDay);
    let gender = document.getElementById('gender').value;
    let religion = document.getElementById('religionOptions').value;
    let phoneNumber = unescapeHTML(document.getElementById('phone').value);
    let stateOfOrigin = unescapeHTML(document.getElementById('state-of-origin').value);
    let country = unescape(document.getElementById('country').value);
    let phoneNumbers =
        phoneNumber.split(';')
            .map((item) => removeAllSpaces(item))
            .filter((item) => item != "")
            .map((item) => { phone: item });  
       

    student.phoneNumbers = phoneNumbers;    
    student.fixedData = {
        title, permanentAddress, currentAddress, stateOfOrigin,
        country, religion, gender, dateOfBirth,
        placeOfBirth, firstName, lastName, emailAddress, 
    }


    let nextTab = document.getElementById('educational-background');
    openTab('educational-background');

}

function createSponsor() {
    if (verifyInputs('finance', false)) {
        let firstName = document.getElementById('sponsor-first-name').value;
        let lastName = document.getElementById('sponsor-last-name').value
        let address = document.getElementById('sponsor-address').value
        let telephone = document.getElementById('sponsor-phone-number').value
        let email = document.getElementById('sponsor-email').value
        student.sponsor = {
            firstName, lastName,
            address, telephone, email,
        }
    }
}

function imageChange(event) {
    let file = event.currentTarget.files[0];
    if (file) {
        let img = document.createElement('img');
        let children = document.getElementById('student-image-view').children;
        if (!!children) {
            for (let child of children) {
                child.remove();
            }
        }

        img.alt = "student-image";
        img.src = URL.createObjectURL(file);
        document.getElementById('student-image-view').appendChild(img);

    } else {
        let firstChild = document.getElementById('student-image-view').firstChild;
        if (firstChild) firstChild.remove;
    }
}


function updateEducation(event) {
    if (!verifyInputs('schools-attended')) return;

    let institution = unescapeHTML(document.getElementById('institute-name').value);
    let beginMonth = unescapeHTML(document.getElementById('edu-begin-month').value);
    let beginYear = unescapeHTML(document.getElementById('edu-begin-year').value);
    let beginDate = new Date(beginYear, beginMonth);

    let endYear = document.getElementById('edu-end-year').value;
    let endMonth = document.getElementById('edu-end-month').value;
    let endDate = new Date(endYear, endMonth);

    let courseRead = unescapeHTML(document.getElementById('edu-course-read').value);
    let qualification = unescapeHTML(document.getElementById('certificate').value);

    let key = `${institution} ${beginDate} ${endDate} ${courseRead} ${qualification}`;
    if (educationMap.has(key)) {
        alert("Duplicate Entry");
        return;
    }

    educationMap.set(key, {
        institution, beginDate,
        endDate, courseRead, qualification,

    });
    event.currentTarget.parentElement.dataset.key = "key";

    insertEducationNode(key, educationMap.get(key));
    clearInputs('schools-attended');

    let parent = event.currentTarget.parentElement.parentElement.parentElement;

    enableButton({ currentTarget: parent }, 'Next', " main-education-data"); 


}



function insertEducationNode(key, data) {

    let tbody = document.getElementById('educational-background').querySelector('tbody');

    let columns = Array.from(tbody.firstElementChild.cloneNode(true).children);

    columns[0].innerHTML = data.institution;
    columns[1].innerHTML = data.qualification;
    columns[2].innerHTML = data.certificate;
    columns[3].innerHTML = getDateStr(data.beginDate);
    columns[4].innerHTML = getDateStr(data.endDate);

    let tr = document.createElement('tr');
    for (let td of columns) {
        tr.appendChild(td);
    }
    tr.dataset.key = key;

    tbody.appendChild(tr);
    tbody.parentElement.style.display = "block";
}


function moveToExperience() {
    if (educationMap.size <= 0) {
        document.getElementById('requiredList').style.display = 'block';
        return;
    }

    if (verifyInputs('main-education-data' )) {
        let nextTab = document.getElementById('experience');
        openTab('experience');
    }
    

    student.fixedData.highestQualification = unescapeHTML(document.getElementById('last-institute-attended').value);
    student.fixedData.lastInstituteAttended = unescapeHTML(document.getElementById('highest-qualification').value);
    student.fixedData.lastInstituteAttended = unescapeHTML(document.getElementById('course-studied').value);


}

function moveToFinanceTab() {
    if (!verifyInputs('key-exp-details')) return;
    
    student.fixedData.currentWorkPlace = unescapeHTML(document.getElementById('current-work-place').value);
    student.fixedData.yearsExperience = +document.getElementById('years-experience').value;



    let nextTab = document.getElementById('finance');
    openTab('finance');
}

function appendExperience() {
    if (verifyInputs('experience-list') == false) return;
    let employer = unescapeHTML(document.getElementById('employer').value);
    let jobTitle = unescapeHTML(document.getElementById('jobTitle').value);

    let beginMonth = document.getElementById('exp-begin-month').value;
    let beginYear = document.getElementById('exp-begin-year').value;

    let endMonth = document.getElementById('exp-end-month').value;
    let endYear = document.getElementById('exp-end-year').value;

    let responsibilities = unescapeHTML(document.getElementById('responsibilities').value).split(";");

    let beginDate = new Date(beginYear, beginMonth);
    let endDate = new Date(endYear, endMonth);

    let key = `${employer} ${beginDate} ${endDate} ${jobTitle} ${responsibilities}`;

    if (expMap.has(key)) {
        alert("Duplicate Entry");
        return;
    }
    expMap.set(key, {
        employer,
        jobTitle,
        responsibilities,
        beginDate,
        endDate,
    });
    insertExperienceNode(key, expMap.get(key));
    clearInputs('experience-list');
}

function insertExperienceNode(key, expData) {

    let tbody = document.getElementById('experience').querySelector('tbody');

    let columns = Array.from(tbody.firstElementChild.cloneNode(true).children);

    columns[0].innerHTML = expData.employer;
    columns[1].innerHTML = expData.jobTitle
    columns[2].innerHTML = getDateStr(expData.beginDate);
    columns[3].innerHTML = getDateStr(expData.endDate);
    columns[4].innerHTML = expData.responsibilities[0];



    let tr = document.createElement('tr');
    for (let td of columns) {
        tr.insertAdjacentElement("beforeend", td);
    }
    tr.insertAdjacentElement("beforeend", columns[5]);
    tr.dataset.key = key
    tbody.insertAdjacentElement("beforeend", tr);
    tbody.parentElement.style.display = "block";
}


function editTable(event) {
    let tr = event.currentTarget.parentElement.parentElement;

    switch (tr.parentElement.id) {
        case "edu-table-body":
            let eduObj = educationMap.get(tr.dataset.key);

            console.dir(eduObj);
            document.getElementById('institute-name').value = eduObj.institution;
            document.getElementById('edu-end-year').value = eduObj.endDate.getFullYear();
            document.getElementById('edu-begin-year').value = eduObj.beginDate.getFullYear();
            document.getElementById('edu-course-read').value = eduObj.courseRead;
            document.getElementById('certificate').value = eduObj.qualification;
            document.getElementById('edu-begin-month').value = eduObj.beginDate.getMonth();
            document.getElementById('edu-end-month').value = eduObj.endDate.getMonth();
            educationMap.delete(tr.dataset.key);
            break;
        case 'exp-table-body':
            let expObj = expMap.get(tr.dataset.key);
            console.dir(expObj);
            
            document.getElementById('responsibilities').value = expObj.responsibilities.join(';/n');
            document.getElementById('exp-end-year').value = expObj.endDate.getFullYear();
            document.getElementById('edu-begin-month').value = expObj.beginDate.getMonth();
            document.getElementById('edu-end-month').value = expObj.endDate.getMonth();
            document.getElementById('exp-begin-year').value = expObj.beginDate.getFullYear();
            document.getElementById('employer').value = expObj.employer;
            document.getElementById('jobTitle').value = expObj.jobTitle;
            expMap.delete(tr.dataset.key);
            break;
    }
    tr.remove();

}


function openHowYouHeard() {
    let nextTab = document.getElementById('how-you-heard');
    createSponsor();
    openTab( 'how-you-heard');

}

function recordHowYouHeard() {
    let checkboxes = document.getElementById("how-you-heard")
        .querySelectorAll('input[type ="checkbox"]:checked');

    for (let box of checkboxes) {
        howYouHeard.add({ means: box.dataset.value, });
    }
    let nextTab = document.getElementById('available-courses');
    openTab('available-courses');
}


function removeRow(event) {
    let tr = event.currentTarget.parentElement.parentElement;
    console.dir(tr);
    let size;
    if (tr.dataset.tabName == 'experience') {
        expMap.delete(tr.dataset.key);
        size = expMap.size;
    } else {
        educationMap.delete(tr.dataset.key);
        size = educationMap.size;
    }


    if (size == 0) {
        tr.parentElement.parentElement.style.display = "none";
    }
    tr.remove();
}

function updateJSON() {
    let availableElem = document.getElementById('available-courses');
    let selectedInput = availableElem.querySelector('input[type = "radio"]:checked');
    if (selectedInput == null) {
        //posible error; 
       return;
    }
    student.selectedProgram = unescape(selectedInput.value);
    let jsonElem = document.getElementById("json-text");

    console.log('Before updating.....');
    console.log(student);
    student.education = Array.from(new Set(educationMap.values()).values());
    student.experience = Array.from(new Set(expMap.values()).values());
    student.means = Array.from(new Set(howYouHeard.values()).values());

    console.log('After updating......');
    console.log(student);
    let json = JSON.stringify(student);
    jsonElem.value = escape(json);


    setCookie("userInputs", json, 14);
}

function updateDayList(event) {
    let dobDay = document.getElementById('dob-day'); 
    let month = document.getElementById('dob-month').value;
    let year = document.getElementById('dob-year').value;

    let date = new Date(year, month, 1);
    date.setDate(date.getDate() - 1);
    let maxDay = date.getDate(); 
    for (let option of dobDay.querySelectorAll('option:nth-child(n+28)')) {
        if (option.value > maxDay) option.visibility = "hidden";
        else {
            console.log(option.tagName); 
            option.style.visibility = ""; 
        }
    }
}


function enableButton(event, buttonName= "Next", verifyID) {
    let tab = event.currentTarget;
    verifyID = verifyID ? verifyID : tab.id; 

    let button = tab.querySelector(`input[value="${buttonName}"]`);

  
    if (tab.id == 'educational-background') {
        setDisabled(!(verifyInputs(verifyID, false) && educationMap.size > 0));
    } else {
        setDisabled(!(verifyInputs(verifyID, false) ));
    }
   
    function setDisabled(disabled) {
        button.disabled = disabled; 
    }
}