const fs = require('fs');
const path = require('path');

function copyFiles(source, target) {
    fs.copyFile(source, target, fs.constants.COPYFILE_FICLONE, err => {
        if (err) console.log(err);
    });
};

const copyDir = (src, dest, callback) => {
    const copy = (copySrc, copyDest) => {
        fs.readdir(copySrc, (error, list) => {
            if (error)  {
                callback(error);
                return;
            }
            
            list.forEach((item) => {
                const oldPath = path.resolve(copySrc, item);
                fs.stat(oldPath, (err, stat) => {
                    if (err) {
                        callback(err);
                    } else{
                        const curSrc = path.resolve(copySrc, item);
                        const curDest = path.resolve(copyDest, item);
                        if (stat.isFile()) {
                            copyFiles(curSrc, curDest);
                        } else if (stat.isDirectory()) {
                            fs.mkdir(curDest, {recursive: true});
                            copy(curSrc, curDest);
                        }
                    }
                });
            });
        });
    }

    fs.access(dest, err => {
        if (err) {
            fs.mkdir(dest, { recursive: true }, err => {
                if (err) {
                    return console.error(err)
                }
                console.log('Folder created');
            });
        }
        copy(src, dest);
    });
};

copyDir(path.resolve(__dirname, 'files'), path.resolve(__dirname, 'files-copy'));