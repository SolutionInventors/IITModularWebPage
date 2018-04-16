module.exports.generateRandomString = () => {
    let str = '';
    for(let i = 0; i < 10; i++) {
        str += String.fromCharCode(32 + Math.floor(90 * Math.random()));
    }
    console.log('Rand- str: ' + str);
    return str;
}; 

module.exports.generateRandomNumber = () => {
    let str = '';
    for (let i = 0; i < 10; i++) {
        str += Math.floor(10 * Math.random());
    }
    console.log('Rand- number: ' + str);
    return str;
}
