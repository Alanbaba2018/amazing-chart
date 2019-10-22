const fs = require('fs');
let data = fs.readFileSync('./klines.json');
data = JSON.parse(data.toString());
const _data = data.map((item, index) => {
  return [1571626800000 + index * 60 * 60 * 1000].concat(item.slice(1));
});
fs.writeFile('./data.json', JSON.stringify(_data), (err) => {
  if (!err) {
    console.log('write success!');
  }
})
