import { Path } from "jsr:@david/path";
import { ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { getShowApi } from "./utils/shows.ts";
import database from "./database/db.ts";

import { TMDB } from "npm:tmdb-ts";

// Set default moment format
import moment from "npm:moment";
import { momentFormat } from "./variables/var.ts";
moment.defaultFormat = momentFormat;

// Check arguments for special commands (db migration, etc..)
import { checkArguments } from "./utils/arguments.ts";
import { createCache, updateCache } from "./utils/tmdb.ts";
await checkArguments();

// Load config file
const config = loadConfig();
if (!config) Deno.exit(1);
if (!config.database) Deno.exit(1);

const db = database.initiate(config.database);

// Get all needed information to fill show database
const tmdb = new TMDB(config.tmdb_key);

// Scan file-system, based on filesystem create database show cache
const showPath = new Path(config.show_folder);
const shows: ShowScan[] = getShowApi(showPath);

// Clean up database
// TODO: Delete from cache database, where path does not exist anymore

// Update database information
const updateReport = await updateCache(tmdb, db);
// Create cache for new files
const createReport = await createCache(shows, tmdb, db);

console.log(`Updated report: ${updateReport}`);
console.log(`Created report: ${createReport}`);

