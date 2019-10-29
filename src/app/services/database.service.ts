import { UserService } from './user.service';
import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { User, UserK, UserAddress, Company, Geo } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    private database: SQLiteObject;
    private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    users = new BehaviorSubject([]);
    company = new BehaviorSubject([]);
    geo = new BehaviorSubject([]);
    address = new BehaviorSubject([]);

    constructor(
        private platform: Platform,
        private sqlitePorter: SQLitePorter,
        private sqlite: SQLite,
        private http: HttpClient
    ) {
       this.platform.ready().then(() => {
        this.sqlite.create({
            name: 'users7.db',
            location: 'default'
        }).then((db: SQLiteObject) => {
            this.database = db;
            this.seedDatabase();
        });
       });
    }
    seedDatabase() {
        this.http.get('assets/SQLITE_USER.sql', { responseType: 'text' })
        .subscribe(sql => {
            this.sqlitePorter.importSqlToDb(this.database, sql)
            .then(_ => {
                // laodData
                this.dbReady.next(true);
            })
            .catch(e => console.error(e));
        });
    }
    getDatabaseState() {
        return this.dbReady.asObservable();
    }
    getUsers(): Observable<User[]> {
        return this.users.asObservable();
    }
    getUserKs(): Observable<UserK[]> {
        return this.users.asObservable();
    }
    getCompany(): Observable<Company[]> {
        return this.company.asObservable();
    }
    getUserAddress(): Observable<UserAddress[]> {
        return this.address.asObservable();
    }
    getGeo(): Observable<Geo[]> {
        return this.geo.asObservable();
    }
    loadNotJoinUsers() {
        this.database.executeSql(`SELECT UID, UNAME, USERNAME, EMAIL, ADDRESS, PHONE,
        WEBSITE, COMPANY FROM USER`, []).then(data => {
            const userArr: UserK[] = [];
            if (data.rows && data.rows.length) {
                for (let i = 0; i < data.rows.length; i++) {
                    userArr.push({
                        uid: data.rows.item(i).uid,
                        uname: data.rows.item(i).uname,
                        username: data.rows.item(i).username,
                        email: data.rows.item(i).email,
                        address: data.rows.item(i).address,
                        phone: data.rows.item(i).phone,
                        website: data.rows.item(i).website,
                        company: data.rows.item(i).company,
                    });
                }
            }
            this.users.next(userArr);
        });
    }
    loadUsers() {
        return this.database.executeSql(
        `SELECT UID, UNAME, USERNAME, EMAIL, PHONE, WEBSITE, U.ADDRESS, A.ID, A.STREET, A.SUITE, A.CITY, A.ZIPCODE, A.GEO,
        G.ID, G.LAT, G.LNG, U.COMPANY, C.ID, C.NAME, C.CATCHPHRASE, C.BS FROM USER U
        LEFT JOIN ADDRESS AS A ON A.ID = U.ADDRESS
        LEFT JOIN GEO AS G ON G.ID = A.GEO
        LEFT JOIN COMPANY AS C ON C.ID = U.COMPANY`, []).then(data => {
            const userArr: User[] = [];
            if (data.rows && data.rows.length) {
                for (let i = 0; i < data.rows.length; i++) {
                    userArr.push({
                        uid: data.rows.item(i).UID,
                        uname: data.rows.item(i).UNAME,
                        username: data.rows.item(i).USERNAME,
                        email: data.rows.item(i).EMAIL,
                        address: {
                            id: data.rows.item(i).ADDRESS,
                            street: data.rows.item(i).STREET,
                            suite: data.rows.item(i).SUITE,
                            city: data.rows.item(i).CITY,
                            zipcode: data.rows.item(i).ZIPCODE,
                            geo: {
                                id: data.rows.item(i).GEO,
                                lat: data.rows.item(i).LAT,
                                lng: data.rows.item(i).LNG
                            }
                        },
                    phone: data.rows.item(i).PHONE,
                    website: data.rows.item(i).WEBSITE,
                    company: {
                        id: data.rows.item(i).COMPANY,
                        name: data.rows.item(i).NAME,
                        catchPhrase: data.rows.item(i).CATCHPHRASE,
                        bs: data.rows.item(i).BS
                    }
                    });
                }
            }
            this.users.next(userArr);
        });
    }

    addUser(id, name, username, email, phone, website) {
        const key = id;
        const data = [id, name, username, email, key, phone, website, key];
        return this.database.executeSql(`INSERT INTO USER (uid, uname, username, email, address, phone, website, company)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, data);
    }
    addUserAddress(id, street, suite, city, zipcode) {
        const key = id;
        const data = [id, street, suite, city, zipcode, key];
        return this.database.executeSql(`INSERT INTO ADDRESS (id, street, suite, city, zipcode, geo)
        VALUES (?, ?, ?, ?, ?, ?)`, data);
    }
    addGeo(id, lat, lng) {
        const key = id;
        const data = [key, lat, lng];
        return this.database.executeSql(`INSERT INTO GEO (id, lat, lng)
        VALUES (?, ?, ?)`, data);
    }
    addCompany(id, name, catchPhrase, bs) {
        const key = id;
        const data = [key, name, catchPhrase, bs];
        return this.database.executeSql(`INSERT INTO COMPANY (id, name, catchPhrase, bs)
        VALUES (?, ?, ?, ?)`, data);
    }
}