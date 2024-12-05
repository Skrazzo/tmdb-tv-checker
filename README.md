# README

TMDB-show-checker is an executable made with Deno 2.0, that checks your shows, if any new seasons or episodes have come out for your shows, and notifies you via email 

## Features
- Finds shows based on files in your files system
- Caches show information from TMDB in an sqlite database
- Updates cache after certain time has passed (configure it in config file)
- Self cleans the database cache
- Notifies you via email (configure it in the config)
- You can mark shows to ignore, so they dont show up in the report

## Argument list
- `--migrate` will create cache database
- `--migrate-fresh` will remigrate the cache database
- `--migrate-down` will delete the database
- `--ignore <show_id>` will ignore the show when scanning for missing episodes
- `--notice <show_id>` will include show in missing report
- `--list-shows` will list all cached shows
- `--list-episodes <show_id>` will list all episodes for the specified show
- `--no-email` will show you report without sending an email to you **(if you have set true in config for email)**

## How to set up
1. Either download source code and run it with `deno run dev`
2. Or download compiled version and run it
3. Set up config.json in the root directory


## Features TODO
- [ ] --list-shows // Lists all show names, and if they're ignored
	- [ ] tmdb_id
	- [ ] rating
	- [ ] overview
	- [ ] release date
	- [ ] total seasons
- [ ] --list-episodes // followed by show id
	- [ ] season and episode
	- [ ] title
	- [ ] rating
	- [ ] overview
	- [ ] release date
- [ ] --no-email // execute normally just without sending an email
- [ ] --help command
