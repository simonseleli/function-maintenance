/**
 * Created by mpande on 2/21/18.
 */
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import * as filesAction from '../actions/files.action';
import { of, Observable } from 'rxjs';
import * as fromServices from '../../services';
import { Store } from '@ngrx/store';

@Injectable()
export class FilesEffects {
  constructor(private actions$: Actions, private fileService: fromServices.MapFilesService) {}

  
  downloadCSV$ = createEffect(() => this.actions$.pipe(
    ofType(filesAction.DOWNLOAD_CSV),
    map((action: filesAction.DownloadCSV) => this.fileService.downloadMapVisualizationAsCSV(action)),
    switchMap(payload => {
      return of(new filesAction.FileDownloadSuccess(payload));
    })
  ));

  
  downloadGML$ = createEffect(() => this.actions$.pipe(
    ofType(filesAction.DOWNLOAD_GML),
    map((action: filesAction.DownloadGML) => this.fileService.downloadMapVisualizationAsGML(action)),
    switchMap(payload => {
      return of(new filesAction.FileDownloadSuccess(payload));
    })
  ));

  
  downloadKML$ = createEffect(() => this.actions$.pipe(
    ofType(filesAction.DOWNLOAD_KML),
    map((action: filesAction.DownloadKML) => this.fileService.downloadMapVisualizationAsKML(action)),
    switchMap(payload => {
      return of(new filesAction.FileDownloadSuccess(payload));
    })
  ));

  
  downloadSHAPEFILE$ = createEffect(() => this.actions$.pipe(
    ofType(filesAction.DOWNLOAD_SHAPEFILE),
    map((action: filesAction.DownloadShapeFile) => this.fileService.downloadMapVisualizationAsSHAPEFILE(action)),
    switchMap(payload => {
      return of(new filesAction.FileDownloadSuccess(payload));
    })
  ));

  
  downloadJSON$ = createEffect(() => this.actions$.pipe(
    ofType(filesAction.DOWNLOAD_JSON),
    map((action: filesAction.DownloadJSON) => this.fileService.downloadMapVisualizationAsGeoJSON(action)),
    switchMap(payload => {
      return of(new filesAction.FileDownloadSuccess(payload));
    })
  ));
}
