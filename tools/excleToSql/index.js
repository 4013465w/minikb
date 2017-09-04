const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const getName = require('./xyname.js');
const moment = require('moment');
const argv = require('yargs')
.option('s', {
    alias : 'school',
    demand: true,
    default: 'yd',
    describe: 'school yd or wj',
    type: 'string'
  })
  .option('p', {
    alias : 'path',
    demand: true,
    default: 'ydxls',
    describe: 'excle路径',
    type: 'string'
  })
  .example('all.js -s yd -p ydall')
  .help('h')
  .argv;
console.time(1);

let sql = '';
const char = ['', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const rootPath = argv.p; 

getName(rootPath);
let studentCourseTemp = 'insert into course (class_name,';
for (var i = 1; i <= 42; i++) {
    studentCourseTemp = studentCourseTemp + ('s' + i) + ',';
}
studentCourseTemp = studentCourseTemp + 's43) values (';


function toSql(pathName) {
    let arr = fs.readdirSync(pathName);
    for (var i = arr.length - 1; i >= 0; i--) {
        let childPath = path.resolve(pathName, arr[i]);
        let stats = fs.lstatSync(childPath, function (err, stats) {
            
        });
        if (stats.isDirectory()) {
            toSql(childPath)
        } else {
            readCourse(childPath);
        }
    }
}

function readCourse(filePath) {
    if (filePath[filePath.length - 1] !== 's') {
        return;
    }
    let workbook = XLSX.readFile(filePath);
    // console.log();
    let sheet = workbook.Sheets.Sheet1;
    let className = sheet['F1'].v.replace('班名:', '');
    let add = 1;
    let currentSql = studentCourseTemp + '"' + className + '"';

    for (let row = 1; row <= 6; row++) {
        if (row %2 === 1) {
            add++;
        }
        for (let col = 1; col <=7; col++) {
            let courseSrt = '';
            for (let i = 1; i <= 8; i++) {
                let num = ((row - 1) * 8 + i + add);
                if (num === 52) {
                    continue;
                }
                let str = char[col] + num;
                if (sheet[str] && sheet[str].v) {
                    // console.log(sheet[str].v);
                    courseSrt += sheet[str].v;
                }
            }
            currentSql = currentSql + ',"' + courseSrt + '"';
        }
    }

    currentSql += ', "");\n';
    sql += currentSql;
}


function getSql(data) {

}

toSql(rootPath);
sql = sql.replace(/\([0-9A-Z\-]*\)/g, '');
let sqlPath = `./sql/courseall-${argv.s}${moment().format()}.sql`;

fs.writeFile(sqlPath, sql, (err) => {
    if (err) throw err;
    console.log('The file has been saved!: ' + sqlPath);
    console.timeEnd(1);
});