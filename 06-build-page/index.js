const fs = require('fs');
const path = require('path');
const fsp = fs.promises;

function init(newPath) {
    fs.writeFile(
        newPath,
        '', 
        (error) => {
        if (error) return console.error(error.message);
    });
};

function copyFiles(source, target) {
    fs.copyFile(source, target, fs.constants.COPYFILE_FICLONE, err => {
        if (err) console.log(err);
    });
};

const copyDir = (src, dest) => {
    const copy = async (copySrc, copyDest) => {
        fs.readdir(copySrc, (error, list) => {
            if (error) return console.error(error);
            
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
                console.log('Folder created');
            });
        }
        copy(src, dest);
    });
};

const readDirectory = async (dir) => {
    const initials = await fsp.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(initials.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? readDirectory(res) : res;
    }));
    return Array.prototype.concat(...files);
}

const isCss = (filepath) => {
    return path.extname(filepath) === '.css';
};

const isFile = async (filepath) => {
    return !!path.extname(filepath);
};

const readFile = (filepath) => {
    return fs.createReadStream(filepath);
}

const assemble = async (src, dist) => {
    const newPath = path.join(dist, 'style.css');
    const writer = fs.createWriteStream(newPath);
    const files = await readDirectory(src);
    for (const file of files) {
        const filepath = file;
        const isFileBoolean = await isFile(filepath);
        const isCssBoolean = isCss(filepath);
        if (isFileBoolean && isCssBoolean) {
            readFile(filepath).on('data', chunk => writer.write(chunk));
        }
    }
};

const checkRoute = (route, type) => {
    fs.access(route,fs.constants.F_OK , (err) => {
        if (err) {
            init(route);
        } else {
            fs.truncate(route, 0, function(){console.log('done')})
        }
        if (type === 'css') {
            assemble(path.resolve(__dirname, 'styles'), path.resolve(__dirname, 'project-dist'));
        }
    });
};

const readAnyFile = async (route) => {
    return await fsp.readFile(route, { encoding: 'utf8' });
};


const createTemplate = async (templateRoute, assetsRoute, dest) => {
    let templateData = await readAnyFile(templateRoute).catch ((e) => {});
    const files = await readDirectory(assetsRoute);
    const writer = fs.createWriteStream(dest);
    for (const file of files) {
        const fileName = path.parse(file).name;
        const replaceRegex = new RegExp(`{{${fileName}}}`);
        let content = await readAnyFile(file).catch ((e) => {});
        templateData = templateData.replace(replaceRegex, content);
    }
    writer.write(templateData);
}


const createDir = (route) => {
    fs.mkdir(route, { recursive: true, force: true }, (error) => {
        if (error) return console.error(error.message);
        checkRoute(path.resolve(__dirname, 'project-dist', 'style.css'), 'css');
        copyDir(path.resolve(__dirname, 'assets'), path.resolve(__dirname, 'project-dist', 'assets'));
        createTemplate(path.resolve(__dirname, 'template.html'), path.resolve(__dirname, 'components'), path.resolve(__dirname, 'project-dist', 'index.html'));
    });
};

const deleteDir = (route) => {
    fs.rm(route, { recursive: true, force: true }, err => {
        if (err) {
          throw err
        }
        createDir(route);
    })
}


const checkDir = async (route) => {
    fs.access(route,fs.constants.F_OK , (err) => {
        if (!err) {
            deleteDir(route);
        } else{
            createDir(route);
        }
    });
};

checkDir(path.resolve(__dirname, 'project-dist'));
