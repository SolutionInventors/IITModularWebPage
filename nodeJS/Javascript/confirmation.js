function imageChange(event) {
    let json = document.getElementById('jsonInput').value; 
    let student = JSON.parse(unescape(unescape(json))); 
    let image = document.getElementById('student-image').files[0]; 

    if (!image || !image.type.lastIndexOf('image') == 0) {
        document.getElementById('submit-form-button').disabled = true; 
        return;
    }
    document.getElementById('jsonInput').value = escape(JSON.stringify(student));

    let modules = document.getElementById('modules').querySelectorAll('input[type="checkbox"]:checked'); 

    console.dir(modules); 
    student.modules = []; 
    for (let module of modules) {
        student.modules.push(unescape(module.value)); 
    }
    document.getElementById('jsonInput').value =
        escape(JSON.stringify(student));
    document.getElementById('submit-form-button').disabled = false; 
}
function removeAllSpaces(str) {
    while (str.lastIndexOf(' ') >= 0) {
        str = str.replace(' ', ''); 
    }
    return str; 
}


