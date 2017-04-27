var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Response, Http } from "@angular/http";
import { Constants } from "./constants";
export var Utilities = (function () {
    function Utilities(constants, http) {
        this.constants = constants;
        this.http = http;
    }
    Utilities.prototype.formatEnumString = function (enumString) {
        enumString = enumString.replace(/_/g, ' ');
        enumString = enumString.toLowerCase();
        return enumString.substr(0, 1) + enumString.replace(/(\b)([a-zA-Z])/g, function (firstLetter) {
            return firstLetter.toUpperCase();
        }).replace(/ /g, '').substr(1);
    };
    Utilities.prototype.handleError = function (error) {
        // In a real world app, we might use a remote logging infrastructure
        var errMsg;
        if (error instanceof Response) {
            var body = error.json() || '';
            var err = body.error || JSON.stringify(body);
            errMsg = error.status + " - " + (error.statusText || '') + " " + err;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        return Observable.throw(errMsg);
    };
    Utilities.prototype.readableName = function (name, hasUnderscore) {
        var readableName = [];
        var count = 0;
        for (var i = 0; i <= name.length - 1; i++) {
            if (i == 0) {
                readableName[count] = name[i].toUpperCase();
                count++;
            }
            else {
                if (name[i] == name[i].toUpperCase()) {
                    if (hasUnderscore) {
                        readableName[count] = '_';
                        count++;
                        readableName[count] = name[i];
                        count++;
                    }
                    else {
                        readableName[count] = ' ';
                        count++;
                        readableName[count] = name[i].toLowerCase();
                        count++;
                    }
                }
                else {
                    readableName[count] = name[i];
                    count++;
                }
            }
        }
        return hasUnderscore ? readableName.join("").toUpperCase() : readableName.join("");
    };
    Utilities.prototype.camelCaseName = function (name) {
        var camelCaseName = [];
        var count = 0;
        for (var i = 0; i <= name.length - 1; i++) {
            if (i == 0) {
                camelCaseName[count] = name[i].toLowerCase();
                count++;
            }
            else {
                if (name[i] == '_' || name[i] == '') {
                    camelCaseName[count] = name[i + 1].toUpperCase();
                    count++;
                    i++;
                }
                else {
                    camelCaseName[count] = name[i].toLowerCase();
                    count++;
                }
            }
        }
        return camelCaseName.join("");
    };
    Utilities.prototype.getUniqueId = function () {
        var _this = this;
        return Observable.create(function (observer) {
            _this.http.get(_this.constants.root_url + 'api/system/id.json?n=1')
                .map(function (res) { return res.json(); })
                .catch(_this.handleError)
                .subscribe(function (response) {
                observer.next(response['codes'][0]);
                observer.complete();
            }, function (error) {
                observer.error(error);
            });
        });
    };
    Utilities.prototype.getUserInformation = function () {
        return this.http.get(this.constants.root_url + 'api/me.json?fields=id,email,userCredentials[userRoles[authorities]]')
            .map(function (response) { return response.json(); })
            .catch(this.handleError);
    };
    Utilities.prototype.enableSendEmail = function () {
        var _this = this;
        this.getDataStore('emails', 'enable').subscribe(function (data) {
            _this.updateDataStore('emails', 'enable', { enabled: true }).subscribe(function (item) {
                console.log(item);
            });
        }, function (error) {
            console.log(error);
            this.createDataStore('emails', 'enable', { enabled: true }).subscribe(function (item) {
                console.log(item);
            });
        });
    };
    Utilities.prototype.getDataStore = function (datastore, key) {
        return this.http.get(this.constants.root_url + 'api/dataStore/' + datastore + '/' + key)
            .map(function (response) { return response.json(); })
            .catch(this.handleError);
    };
    Utilities.prototype.updateDataStore = function (datastore, key, object) {
        return this.http.put(this.constants.root_url + 'api/dataStore/' + datastore + '/' + key, object)
            .map(function (response) { return response.json(); })
            .catch(this.handleError);
    };
    Utilities.prototype.createDataStore = function (datastore, key, object) {
        return this.http.post(this.constants.root_url + 'api/dataStore/' + datastore + '/' + key, object)
            .map(function (response) { return response.json(); })
            .catch(this.handleError);
    };
    Utilities.prototype.isUndefined = function (value) {
        return value == undefined ? true : false;
    };
    Utilities.prototype.isNull = function (value) {
        return value == null ? true : false;
    };
    Utilities = __decorate([
        Injectable(), 
        __metadata('design:paramtypes', [Constants, Http])
    ], Utilities);
    return Utilities;
}());
//# sourceMappingURL=utilities.js.map