import { DatabaseService } from './../services/database.service';
import { User, UserK } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  dbUsers: Array<User>;
  dbUserKs: Array<UserK>;
  subscription = new Subscription();

  constructor(private db: DatabaseService, public userService: UserService) {}

  async getUserData() {
    try {
      await this.db.loadUsers();
      this.subscription = this.db.getUsers().subscribe(data => {
        this.dbUsers = data;
        Promise.resolve(data);
      });
    } catch (err) { console.error(err); Promise.reject(null); }
  }

  ngOnInit(): void {
    this.userService.loadUsers().then(_ => {
      this.db.getDatabaseState().subscribe(rdy => {
        this.getUserData().then(_ => {
          if (this.dbUsers[0] == null) {
            this.userService.users.forEach(el => {
              this.db.addUser(el.uid, el.uname, el.username, el.email, el.phone, el.website)
              .then(_ => {
                this.db.addUserAddress(el.uid, el.address.street, el.address.suite, el.address.city, el.address.zipcode)
                .then(_ => {
                  this.db.addGeo(el.uid, el.address.geo.lat, el.address.geo.lng)
                  .then(_ => {
                    this.db.addCompany(el.uid, el.company.name, el.company.catchPhrase, el.company.bs)
                    .finally(() => {
                        this.getUserData();
                      });
                    });
                  });
                });
              });
            }
          });
        });
      });
    }


}
