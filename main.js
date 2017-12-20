const cheerio = require('cheerio');
const child_process = require('child_process');
const fs = require('fs');
const moment = require('moment');
const rp = require('request-promise');
const secrets = require('./secrets.js');

var ts = moment().unix();

child_process.execSync(`mkdir csci571_${ts} &&
          mkdir csci571_${ts}/slides &&
          mkdir csci571_${ts}/exams`);

process.on('SIGINT', () => process.exit(1));
process.on('exit', (code) => {
  if(code) child_process.execSync(`rm -rf csci571_${ts}`);
});

rp('http://cs-server.usc.edu:45678/lectures.html').then((data) => {
  $ = cheerio.load(data);
  $('td').find('a').each((i, el) => {
    var re = new RegExp('.+?\.pdf');
    if(re.test($(el).attr('href'))) {
      var options = {
        uri: `http://cs-server.usc.edu:45678/${$(el).attr('href')}`,
        auth: {
          user: secrets.user,
          pass: secrets.pass,
          sendImmediately: false
        },
        encoding:'binary'
      }
      var arr = $(el).attr('href').split('/');
      var name = arr[arr.length-1].toLowerCase();
      var cat = arr[0];
      moment.suppressDeprecationWarnings = true;
      var date = moment(`${$(el).parent().parent().children().first().next().html()} 2017`).format('YY-MM-DD_');
      if(date === 'Invalid date') date = String();
      rp(options).then((data) => {
        console.log(`Downloaded ${cat}/${name}`);
        fs.writeFile(`csci571_${ts}/${cat}/${date}${name}`, data, 'binary', () => {});
      }).catch((error) => {
        console.error(`Couldn't download ${cat}/${name}`);
      })
    }
  });
}).catch((error) => {
  console.error(`Couldn't retrieve lectures`);
  process.exit(1);
});