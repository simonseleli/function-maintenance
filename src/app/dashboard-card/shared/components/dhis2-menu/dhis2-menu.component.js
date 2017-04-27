var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef, Input } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs';
export var Dhis2MenuComponent = (function () {
    function Dhis2MenuComponent(elementRef, http) {
        this.elementRef = elementRef;
        this.http = http;
        window['dhis2'] = window['dhis2'] || {};
        window['dhis2'].settings = window['dhis2'].settings || {};
        window['dhis2'].settings.baseUrl = '/';
    }
    Dhis2MenuComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.getSystemSettings()
            .subscribe(function (data) {
            _this.start_module = data.startModule;
            _this.application_title = data.applicationTitle;
            _this.application_style = ('currentStyle' in data) ? data.currentStyle : data.keyStyle;
            /*// Adding font awesome for Menu Icons
             const font_awesome = document.createElement('link');
             font_awesome.setAttribute('rel', 'stylesheet');
             font_awesome.setAttribute('type', 'text/css');
             font_awesome.setAttribute('href', this.dhis2_url + 'dhis-web-commons/font-awesome/css/font-awesome.min.css' );
             document.getElementsByTagName('head')[0].appendChild(font_awesome);
  
             // Adding bootstrap_css file for Menu Icons
             const bootstrap_css = document.createElement('link');
             bootstrap_css.setAttribute('rel', 'stylesheet');
             bootstrap_css.setAttribute('type', 'text/css');
             bootstrap_css.setAttribute('href', this.dhis2_url + 'dhis-web-commons/bootstrap/css/bootstrap.min.css' );
             document.getElementsByTagName('head')[0].appendChild(bootstrap_css);*/
            // Adding menu_css file for Menu Icons
            var menu_css = document.createElement('link');
            menu_css.setAttribute('rel', 'stylesheet');
            menu_css.setAttribute('type', 'text/css');
            menu_css.setAttribute('href', _this.dhis2_url + '/dhis-web-commons/css/menu.css');
            document.getElementsByTagName('head')[0].appendChild(menu_css);
            _this.getUserSettings()
                .subscribe(function (userData) {
                _this.application_style = ('keyStyle' in userData) ? userData.keyStyle : _this.application_style;
                // adding color dhis css to match the selected styles
                var element = document.createElement('link');
                element.setAttribute('rel', 'stylesheet');
                element.setAttribute('type', 'text/css');
                element.setAttribute('href', _this.dhis2_url + '/dhis-web-commons/css/' + _this.application_style);
                document.getElementsByTagName('head')[0].appendChild(element);
            }, function (error) {
                var element = document.createElement('link');
                element.setAttribute('rel', 'stylesheet');
                element.setAttribute('type', 'text/css');
                element.setAttribute('href', _this.dhis2_url + '/dhis-web-commons/css/' + _this.application_style);
                document.getElementsByTagName('head')[0].appendChild(element);
            });
        });
    };
    /**
     * This function helps to solve the parse error to redirect to main page
     */
    Dhis2MenuComponent.prototype.redirecAction = function () {
        window.location.href = this.dhis2_url + this.start_module + '/index.action';
    };
    Dhis2MenuComponent.prototype.ngAfterViewInit = function () {
        /*const s = document.createElement('script');
         s.type = 'text/javascript';
         s.src = this.dhis2_url + 'dhis-web-commons/javascripts/jQuery/jquery.min.js';
         document.getElementsByTagName('head')[0].appendChild(s);*/
        var _this = this;
        setTimeout(function () {
            // adding nessesary script tags for the menu
            var k = document.createElement('script');
            k.type = 'text/javascript';
            k.src = '/dhis-web-commons/javascripts/dhis2/dhis2.translate.js';
            _this.elementRef.nativeElement.appendChild(k);
            var j = document.createElement('script');
            j.type = 'text/javascript';
            j.src = '/dhis-web-commons/javascripts/dhis2/dhis2.menu.js';
            _this.elementRef.nativeElement.appendChild(j);
            var g = document.createElement('script');
            g.type = 'text/javascript';
            g.src = '/dhis-web-commons/javascripts/dhis2/dhis2.menu.ui.js';
            _this.elementRef.nativeElement.appendChild(g);
        }, 100);
    };
    // Get system wide settings
    Dhis2MenuComponent.prototype.getSystemSettings = function () {
        //noinspection TypeScriptUnresolvedFunction
        return this.http.get(this.dhis2_url + '/api/systemSettings.json')
            .map(function (response) { return response.json(); })
            .catch(this.handleError);
    };
    // Get User Specific Settings
    Dhis2MenuComponent.prototype.getUserSettings = function () {
        //noinspection TypeScriptUnresolvedFunction
        return this.http.get(this.dhis2_url + '/api/userSettings.json')
            .map(function (response) { return response.json(); })
            .catch(this.handleError);
    };
    // Handling error
    Dhis2MenuComponent.prototype.handleError = function (error) {
        return Observable.throw(error);
    };
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], Dhis2MenuComponent.prototype, "dhis2_url", void 0);
    Dhis2MenuComponent = __decorate([
        Component({
            selector: 'app-dhis2-menu',
            templateUrl: './dhis2-menu.component.html',
            styleUrls: ['./dhis2-menu.component.css']
        }), 
        __metadata('design:paramtypes', [ElementRef, Http])
    ], Dhis2MenuComponent);
    return Dhis2MenuComponent;
}());
//# sourceMappingURL=dhis2-menu.component.js.map