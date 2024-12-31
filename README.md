# tmdb-tv-checker

tmdb-tv-checker is an executable made with Deno 2.0, that checks your shows, if any new seasons or episodes have come out for your shows, and notifies you via email

## Features

-   Finds shows based on files in your filesystem
-   Caches show information from TMDB in an sqlite database
-   Notifies you via email when new episodes are available
-   Ignore and include specific shows
-   Configurable via config file

## Installation

1. Download the latest release from the [releases page](https://github.com/Skrazzo/tmdb-tv-checker/releases)
2. Create the config file with `./tmdb --config` and configure it

You will need to configure the following:

-   `tmdb_key` - The API key for TMDB
-   `show_folder` - The folder to search for shows
-   `resend_key` - (optional) The API key for the email service - resend
-   `email` - (optional) The email address to send notifications to

3. Finally, run `./tmdb` to check for any missing episodes!

## Arguments

| Argument                    | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `--help`                    | Shows all available arguments                    |
| `--config`                  | Creates config file                              |
| `--migrate`                 | Creates cache database                           |
| `--migrate-fresh`           | Remigrates cache database                        |
| `--migrate-down`            | Deletes database                                 |
| `--ignore <show_id>`        | Excludes show from scan                          |
| `--notice <show_id>`        | Includes show in report                          |
| `--list-shows`              | Lists cached shows                               |
| `--list-episodes <show_id>` | Lists episodes for specified show                |
| `--no-email`                | Shows report without emailing (if email enabled) |

## Development

This project uses [deno](https://deno.land/) and [typescript](https://www.typescriptlang.org/). Make sure you have both installed.

1. Clone the repository
2. Initialize the project (both deno and the config file)
3. Run `deno run dev` to start the project
