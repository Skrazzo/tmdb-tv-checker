import {Knex, knex} from 'npm:knex';
import { testShow } from "./types/index.ts";

const config: Knex.Config = {
    client: 'sqlite3',
    connection: {
        filename: 'database/test.sqlite'
    }
}



