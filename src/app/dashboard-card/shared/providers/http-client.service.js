var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
export var HttpClientService = (function () {
    function HttpClientService(http) {
        this.http = http;
        this.APIURL = "/api/24/";
        this.http = http;
    }
    HttpClientService.prototype.createAuthorizationHeader = function (headers, options) {
        if (options) {
            for (var key in options) {
                headers.append(key, options[key]);
            }
        }
    };
    HttpClientService.prototype.get = function (url) {
        var headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.get(this.APIURL + url, {
            headers: headers
        });
    };
    HttpClientService.prototype.post = function (url, data, options) {
        var headers = new Headers();
        this.createAuthorizationHeader(headers, options);
        return this.http.post(this.APIURL + url, data, {
            headers: headers
        });
    };
    HttpClientService.prototype.put = function (url, data, options) {
        var headers = new Headers();
        this.createAuthorizationHeader(headers, options);
        return this.http.put(this.APIURL + url, data, {
            headers: headers
        });
    };
    HttpClientService = __decorate([
        Injectable(), 
        __metadata('design:paramtypes', [Http])
    ], HttpClientService);
    return HttpClientService;
}());
//# sourceMappingURL=http-client.service.js.map