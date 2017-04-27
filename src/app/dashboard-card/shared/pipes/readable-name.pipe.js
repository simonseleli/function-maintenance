var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Pipe } from '@angular/core';
export var ReadableNamePipe = (function () {
    function ReadableNamePipe() {
    }
    ReadableNamePipe.prototype.transform = function (name, underscore) {
        var readableName = [];
        var count = 0;
        for (var i = 0; i <= name.length - 1; i++) {
            if (i == 0) {
                readableName[count] = name[i].toUpperCase();
                count++;
            }
            else {
                if (name[i] == name[i].toUpperCase() && name[i - 1] == name[i - 1].toLowerCase()) {
                    if (underscore) {
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
                    readableName[count] = name[i].toLowerCase();
                    count++;
                }
            }
        }
        return underscore ? readableName.join("").toUpperCase() : readableName.join("");
    };
    ReadableNamePipe = __decorate([
        Pipe({
            name: 'readableName'
        }), 
        __metadata('design:paramtypes', [])
    ], ReadableNamePipe);
    return ReadableNamePipe;
}());
//# sourceMappingURL=readable-name.pipe.js.map