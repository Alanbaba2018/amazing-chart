const fs = require('fs');
let data = fs.readFileSync('./data.json');
data = JSON.parse(data.toString());
const _data = data.map(item => {
  return {
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4]
  }
});
fs.writeFile('./src/data.json', JSON.stringify(_data), (err) => {
  if (!err) {
    console.log('write success!');
  }
})
