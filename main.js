const rp = require('request-promise');
const cheerio = require('cheerio');
const writeFile = require('fs').writeFile;
const execSync = require('child_process').execSync;
const secrets = require('./secrets.json');

var ts = Math.floor(new Date()/1000);

execSync(`mkdir csci571_${ts} &&
          mkdir csci571_${ts}/slides &&
          mkdir csci571_${ts}/exams`);

rp('http://cs-server.usc.edu:45678/lectures.html')
.then((data) => {
  $ = cheerio.load(data);
  $('td').find('a').each((i, el) => {
    var re = new RegExp('.+?\.pdf');
    var found = re.test($(el).attr('href'));
    if(found) {
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
      var name = arr[arr.length-1];
      var cat = arr[0];
      rp(options)
      .then((data) => {
        console.log(`Finished ${cat}/${name}`);
        writeFile(`csci571_${ts}/${cat}/${name}`, data, 'binary', () => {});
      });
    }
  });
})