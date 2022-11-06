const path = require('path');
const fs = require('fs');

/*
const fullPath = path.join(__dirname, 'secret-folder');*/

fs.readdir(path.join(__dirname, 'secret-folder'), 
    'utf-8', 
    (err, files) => {
    if (err) throw err;

    for (let i = 0; i < files.length; i++) {
        fs.stat(path.join(__dirname, 'secret-folder', files[i]), (err, stats) => {
            if (err) throw err;

            if (stats.isFile()) {
                const fileArr = files[i].split('.');
                console.log(`${fileArr[0]} - ${fileArr[1]} - ${stats["size"]/1000}Kb`);
            }
        });
    }
});