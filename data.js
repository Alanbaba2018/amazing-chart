const fs = require('fs');
let data = fs.readFileSync('./data.json');
data = JSON.parse(data.toString());
const _data = data.map(item => {
  return {
    time: item[0],
    open: Number(item[1]),
    high: Number(item[2]),
    low: Number(item[3]),
    close: Number(item[4])
  }
});
fs.writeFile('./src/data.json', JSON.stringify(_data), (err) => {
  if (!err) {
    console.log('write success!');
  }
})
