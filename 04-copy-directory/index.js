const fs = require('fs');
const path = require('path');

function copyFiles(source, target) {
    fs.copyFile(source, target, fs.constants.COPYFILE_FICLONE, err => {
        if (err) console.log(err);
        console.log(`Copied ${source} to ${target}`);
    })
}

const copyDir = (src, dest, callback) => {
    console.log(src, dest);
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
                            //fs.createReadStream(curSrc).pipe(fs.createWriteStream(curDest))
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
            fs.mkdir(dest, {recursive: true});
        }

        copy(src, dest);
    });
};

copyDir(path.resolve(__dirname, 'files'), path.resolve(__dirname, 'files-copy'));