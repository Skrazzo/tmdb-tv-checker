# tmdb-tv-checker

A command-line tool that helps you keep track of your TV shows and anime collection. Made with
[Deno 2.0](https://deno.land/) for a smooth experience. Perfect for media server owners who want to stay on top of their
collection.

## Features

tmdb-tv-checker automatically:

- Scans your media folders
- Checks for new episodes and seasons using TMDB
- Finds missing episodes in your collection
- Sends you email notifications about what's missing

you can also:

- Ignore and include specific shows
- Configure via config file

## Installation

1. Download the latest release from the [releases page](https://github.com/Skrazzo/tmdb-tv-checker/releases)
2. Create the config file with `./tmdb --config` and configure it

You will need to configure the following:

- `tmdb_key` - The API key for TMDB
- `show_folders` - Folders to search for shows
- `resend_key` - (optional) The API key for the email service - resend
- `email` - (optional) The email address to send notifications to

3. Finally, run `./tmdb --start` to check for any missing episodes!

It is reccomended to run the checker as a cron job, to check for new episodes every Nth day or week.

## Arguments

| Argument             | Description                                      |
| -------------------- | ------------------------------------------------ |
| `--help`             | Shows all available arguments                    |
| `--config`           | Creates config file                              |
| `--start`            | Starts the checker                               |
| `--list`             | Lists cached shows                               |
| `--list <show_id>`   | Lists episodes for specified show                |
| `--ignore <show_id>` | Excludes show from scan                          |
| `--notice <show_id>` | Includes show in scan                            |
| `--migrate`          | Creates cache database                           |
| `--migrate fresh`    | Remigrates cache database                        |
| `--migrate down`     | Deletes database                                 |
| `--no-email`         | Shows report without emailing (if email enabled) |

## Development

This project uses [deno](https://deno.land/). Make sure you have it installed.

1. Clone the repository
2. Initialize the project (both deno and the config file)
3. Run `deno run dev` to start the project
