import fs from "fs";
import { probability } from "./probability";

const mariadb = require('mariadb');
const cfg = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const pool = mariadb.createPool({
    host: cfg.dbHost,
    user: cfg.dbUser,
    password: cfg.dbPass,
    database: cfg.dbDatabase,
})

export class Schmuser {

    private _discordID: string;
    private _schmusis: number;

    constructor(id: string, schmusis: number) {
        this._discordID = id;
        this._schmusis = schmusis;
    }

    public get schmusis() {
        return this._schmusis;
    }

    public get discordID() {
        return this._discordID;
    }

    public async addSchmusi(num: number) {
        let conn;
        try {
            conn = await pool.getConnection()
            conn.query("UPDATE schmusis SET count=? WHERE name=?", [this.schmusis + num, this._discordID]);
            this._schmusis += num;
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.end();
        }
    }

    public static async selectSchmuserDataByID(id: string) {
        let data;
        let conn;

        try {
            conn = await pool.getConnection()
            data = await conn.query("SELECT * FROM schmusis WHERE name=?", [id]);
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.end();
        }
        return data[0];
    }

    public static async createSchmuserInDB(id: string) {
        let conn;
        try {
            conn = await pool.getConnection()
            conn.query("INSERT INTO schmusis (name, count) VALUES (?, 0)", [id])
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.end();
        }
        return new Schmuser(id, 0);
    }

    public static async getSchmuserByID(id: string) {
        let schmuserData;
        let conn;
        try {
            conn = await pool.getConnection()
            const data = await conn.query("SELECT * FROM schmusis WHERE name=?", [id]);
            schmuserData = data[0];
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.end();
        }

        if (!schmuserData) {
            throw new Error("No Schmuser found with ID: " + id);
        }

        return new Schmuser(schmuserData.name, schmuserData.count)
    }

    public static async getAllSchmusers() {

        const schmuserArr: Schmuser[] = [];
        let conn;
        let data;

        try {
            conn = await pool.getConnection()
            data = await conn.query("SELECT * FROM schmusis")
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.end();
        }

        if (!data) {
            throw new Error("No data!");
        }

        for (const schmuserData of data) {
            schmuserArr.push(new Schmuser(schmuserData.name, schmuserData.count))
        }

        return schmuserArr;
    }

    public async stealSchmusi(id: string) {
        try {
            const target = await Schmuser.getSchmuserByID(id);

            if (probability(0.2)) {
                target.addSchmusi(-1);
                this.addSchmusi(1)
                return true;
            } else {
                target.addSchmusi(1);
                this.addSchmusi(-1)
                return false;
            }

        } catch (err) {
            throw new Error(err)
        }
    }

}