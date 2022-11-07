const fs = require('fs');
const path = require('path');
const fsp = fs.promises;
const async = require('async');

const { stdin, stdout, exit } = process;

function init(newPath) {
    fs.writeFile(
        newPath,
        '', 
        (error) => {
        if (error) return console.error(error.message);
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
    const arr = filepath.split('.');
    return path.extname(filepath) === '.css';
};

const isFile = async (filepath) => {
    return !!path.extname(filepath);
};

const readFile = (filepath) => {
    return fs.createReadStream(filepath);
}

const assemble = async (src, dist) => {
    const newPath = path.join(dist, 'bundle.css');
    const writer = fs.createWriteStream(newPath);
    const files = await readDirectory(src);
    for (const file of files) {
        const filepath = file;
        const isFileBoolean = await isFile(filepath);
        const isCssBoolean = isCss(filepath);
        console.log(isFileBoolean, isCssBoolean);
        if (isFileBoolean && isCssBoolean) {
            readFile(filepath).on('data', chunk => writer.write(chunk));
        }
    }
};

const checkRoute = (route) => {
    fs.access(route,fs.constants.F_OK , (err) => {
        if (err) {
            init(route);
        } else {
            fs.truncate(route, 0, function(){console.log('done')})
        }
        assemble(path.resolve(__dirname, 'styles'), path.resolve(__dirname, 'project-dist'));
    });
}

checkRoute(path.resolve(__dirname, 'project-dist', 'bundle.css'))
