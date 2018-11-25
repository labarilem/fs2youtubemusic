const program = require('commander');
const asciify = require('asciify');
const chalk = require('chalk');
const process = require('process');
var { migrateMusicLibrary } = require('./migrator');

asciify('fs2youtubemusic', { color: 'red', font: 'standard' }, run);

async function run(err, title) {
  console.log(title);
  console.log(chalk.red('Migrate music from your filesystem to your Youtube Music account by liking videos.\n'));

  program
    .version('1.0.0')
    .description('Migrates music from your filesystem to your Youtube Music account by liking videos.')
    .option('-p, --path [directory]', 'Path to your music directory [directory].', process.cwd())
    .option('-s, --skipto [subdirectory]', 'Skip migration to this subdirectory of your music directory.', null)
    .parse(process.argv);

  try {
    await migrateMusicLibrary(program.path, program.skipto);
  } catch (err) {
    console.error(err);
  }

}
