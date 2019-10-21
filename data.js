const fs = require('fs');
let data = fs.readFileSync('./data.json');
data = JSON.parse(data.toString());
console.log(data);
const _data = data.map((item, index) => {
  return {
    ...item,
    time: 1571626800000 + index * 60 * 60 * 1000
  }
});
fs.writeFile('./data.json', JSON.stringify(_data), (err) => {
  if (!err) {
    console.log('write success!');
  }
})
