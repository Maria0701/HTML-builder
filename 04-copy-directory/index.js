const fs = require('fs');
const path = require('path');

function copyFiles(source, target) {
    fs.copyFile(source, target, fs.constants.COPYFILE_FICLONE, err => {
        if (err) console.log(err);
    });
};

const copyDir = (src, dest) => {
    const copy = (copySrc, copyDest) => {
        fs.readdir(copySrc, (error, list) => {
            if (error)  {
                return console.error(error);
            }
            
            list.forEach((item) => {
                const oldPath = path.resolve(copySrc, item);
                fs.stat(oldPath, (err, stat) => {
                    if (err) {
                        return console.error(error);
                    } else{
                        const curSrc = path.resolve(copySrc, item);
                        const curDest = path.resolve(copyDest, item);
                        if (stat.isFile()) {
                            copyFiles(curSrc, curDest);
                        } else if (stat.isDirectory()) {
                            fs.mkdir(curDest, {recursive: true},(error) => {
                                if (error) return console.error(error.message);
                                copy(curSrc, curDest);
                            });
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
                
            });
        } else {
            fs.rm(dest, { recursive: true, force: true }, err => {
                if (err) {
                    return console.error(err)
                }
                fs.mkdir(dest, { recursive: true }, err => {
                    if (err) {
                        return console.error(err)
                    }
                    copy(src, dest);
                });
            })
        }
        
    });
};

copyDir(path.resolve(__dirname, 'files'), path.resolve(__dirname, 'files-copy'));