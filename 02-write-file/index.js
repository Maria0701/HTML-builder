const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit } = process;
const fullPath = path.join(__dirname, 'notes.txt');

function init() {
    fs.writeFile(
        fullPath,
        '', 
        (error) => {
        if (error) return console.error(error.message);
    });
};

function create(content) {
    fs.access(fullPath,fs.constants.F_OK , (err) => {
        if (err) init();
        fs.readFile(fullPath, (error, data) => {
            if (error) return console.error(error.message);
            const currData = data.toString();

            if (content === 'exit\r\n') {
                exit();
            }

            const newData = currData + content;
            fs.writeFile(fullPath, newData, (error) => {
                if (error) return console.error(error.message);
                console.log('текст записан');
            });
        });
    });
};

stdout.write('Привет! Напиши что-нибудь! \n');

stdin.on('data', data => {
    const dataString = data.toString();
    const hasIncorrectLength = dataString.length < 0;
    if (hasIncorrectLength) {
        stdout.write('Напишите не менее одного символа');
        exit();
    }
    create(dataString);
});

process.on('exit', () => {
    stdout.write('Удачи');
});

process.on('SIGINT', () => process.exit());
