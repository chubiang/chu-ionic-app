import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UserService {
  getUsers: any;

    constructor() { }

    users: User[];
    fakeUsers: Array<User> = new Array(5);

    loadUsers() {
        return fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(data => {
            this.users = data.map(e => {
                e['uid'] = e['id'];
                e['uname'] = e['name'];
                return e;
            });
        });
    };
}

export class UserK {
    uid: number;
    uname: string;
    username: string;
    email: string;
    address: number;
    phone: string;
    website: string;
    company: number;
}

export class User {
    uid: number;
    uname: string;
    username: string;
    email: string;
    address: UserAddress;
    phone: string;
    website: string;
    company: Company;
}

export interface UserAddress {
    id?: number;
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: Geo;
}
export interface Company {
    id?: number;
    name: string;
    catchPhrase: string;
    bs: string;
}
export interface Geo {
    id?: number;
    lat: string;
    lng: string;
}