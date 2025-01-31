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

            if (content === 'exit') {
                exit();
            }

            const newData = currData + '\n' +content;
            fs.writeFile(fullPath, newData, (error) => {
                if (error) return console.error(error.message);
                console.log('текст записан');
            });
        });
    });
};

stdout.write('Привет! Напиши что-нибудь!\n');

stdin.on('data', data => {
    const dataString = data.toString().trim();
    const stringArray = dataString.split('');
    const hasIncorrectLength = stringArray.length === 0;
    if (hasIncorrectLength) {
        stdout.write('Напишите не менее одного символа\n');
    } else {
        create(dataString);
    }
});

process.on('exit', () => {
    stdout.write('Удачи');
});

process.on('SIGINT', () => process.exit());
