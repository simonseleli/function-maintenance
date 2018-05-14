import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Visualization} from "../../models/visualization";
import {Symbol, Subject, Observable} from "rxjs";
import {Utilities} from "../../providers/utilities";
// import {Angular2Csv} from "angular2-csv";

export const VISUALIZATION_WITH_NO_OPTIONS = ['USERS', 'REPORTS', 'RESOURCES', 'APP'];

export const DASHBOARD_SHAPES = [
  {
    shape: 'NORMAL',
    shapeClasses: ['col-md-4', 'col-sm-6', 'col-xs-12','dashboard-card']
  },
  {
    shape: 'DOUBLE_WIDTH',
    shapeClasses: ['col-md-8', 'col-sm-6', 'col-xs-12','dashboard-card']
  },
  {
    shape: 'FULL_WIDTH',
    shapeClasses: ['col-md-12', 'col-sm-12', 'col-xs-12','dashboard-card']
  },
];

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css']
})
export class DashboardCardComponent implements OnInit {

  @Input() cardData: any = {};
  @Input() externalDimensions: any[] = [];
  @Input() externalLayout: any = {};
  @Input() externalAnalytics: any = null;
  cardChangeStatus$: Subject<string> = new Subject<string>();
  cardChangeStatus: Observable<string>;
  visualizationObject: Visualization;
  cardConfiguration: any = {
    hideCardBorders: true,
    showCardHeader: false,
    showCardFooter: false,
    defaultHeight: "100%",
    defaultItemHeight: "100%",
    fullScreenItemHeight: "75vh",
    fullScreenHeight: "80vh"
  };

  dashboardShapes: any[] = DASHBOARD_SHAPES;
  visualizationWithNoOptions: any[] = VISUALIZATION_WITH_NO_OPTIONS;
  showFullScreen: boolean = false;
  currentVisualization: string;
  customFilters: any[] = [];
  constructor(
    private utilities: Utilities
  ) {
    this.cardChangeStatus$.next('null');
    this.cardChangeStatus = this.cardChangeStatus$.asObservable();
  }

  ngOnInit() {
    /**
     * Get initial details from dashboard card data
     * @type {{}}
     */
    this.visualizationObject = {
      id: this.cardData.hasOwnProperty('id') ? this.cardData.id : null,
      name: this.cardData.hasOwnProperty('displayName') ? this.cardData.displayName : null,
      type: this.cardData.hasOwnProperty('type') ? this.cardData.type : null,
      created: this.cardData.hasOwnProperty('created') ? this.cardData.created : null,
      lastUpdated: this.cardData.hasOwnProperty('lastUpdated') ? this.cardData.lastUpdated: null,
      shape: this.cardData.hasOwnProperty('shape') ? this.cardData.shape : 'NORMAL',
      details: {
        cardHeight: this.cardConfiguration.defaultHeight,
        itemHeight: this.cardConfiguration.defaultItemHeight,
        currentVisualization: this.cardData.hasOwnProperty('type') ? this.cardData.type : null,
        externalDimensions: this.externalDimensions,
        externalLayout: this.externalLayout,
        cardStatusId: Math.random().toString(36).substr(2, 5)
      },
      layers: [],
      operatingLayers: []
    };

    /**
     * Include external analytics if provided
     */
    if(this.externalAnalytics != null) {
      this.visualizationObject.layers.push({settings: {}, analytics: this.externalAnalytics});
    }

    /**
     * Get favorite details if any
     */
    if(this.visualizationObject.type != null) {
      if(this.cardData.hasOwnProperty(this.utilities.camelCaseName(this.visualizationObject.type))) {
        let favoriteData = this.cardData[this.utilities.camelCaseName(this.visualizationObject.type)];
        if(favoriteData.hasOwnProperty('id')) {
          this.visualizationObject.details.favorite = {
            type: this.utilities.camelCaseName(this.visualizationObject.type),
            id: favoriteData.id
          };
        }
      }
    } else {
      console.warn('Dashboard has no type')
    }

    /**
     * get current visualization
     * @type {any}
     */
    this.currentVisualization = this.visualizationObject.type;
  }

  // ngOnChanges() {
  //   this.initializeCard();
  // }

  onExternalSourceChange() {
    this.visualizationObject.details.externalDimensions = this.externalDimensions;
    this.visualizationObject.details.externalLayout = this.externalLayout;

    this.cardChangeStatus$.next(Math.random().toString(36).substr(2, 5));
    this.cardChangeStatus = this.cardChangeStatus$.asObservable();
  }

  /**
   * Hide options for
   * @param visualizationType
   * @param visualizationWithNoOptions
   * @returns {boolean}
   */
  hideOptions(visualizationType, visualizationWithNoOptions: any[] = []): boolean {
    let hide = false;
    if(visualizationWithNoOptions != undefined && visualizationWithNoOptions.length > 0) {
      visualizationWithNoOptions.forEach(visualizationValue => {
        if (visualizationType == visualizationValue) {
          hide = true;
        }
      });
    }
    return hide;
  }

  updateDashboardCard(filterValues): void {
    /**
     * Make sure that array is passed
     */
    if(typeof filterValues[Symbol.iterator] !== 'function') {
      filterValues = [filterValues]
    }

    this.customFilters = filterValues;
  }


  /**
   * Function for resizing dashboard card from normal,double width to full width
   * @param currentShape
   * @param shapes
   */
  resizeDashboard(currentShape: string, shapes: any[] = []): void {
    let newShape: string = 'NORMAL';
    if(shapes != undefined && shapes.length > 1) {
      shapes.forEach((shapeValue, shapeIndex) => {
        if(shapeValue.hasOwnProperty('shape') && shapeValue.shape == currentShape) {
          if (shapeIndex + 1 < shapes.length) {
            newShape = shapes[shapeIndex + 1].shape
          }
        }
      });
    } else {
      console.warn('Shapes not supplied or is empty');
    }

    //@todo update in the system also
    this.visualizationObject.shape = newShape;

  }

  /**
   * Function to get classes for the selected shape
   * @param currentShape
   * @param shapes
   * @returns {any[]}
   */
  getDashboardShapeClasses(currentShape, shapes: any[] = []): any[] {
    let shapeClasses: any[] = ['col-md-4', 'col-sm-6', 'col-xs-12','dashboard-card'];
    if(shapes != undefined && shapes.length > 1) {
      for(let shapeValue of shapes) {
        if(shapeValue.hasOwnProperty('shape') && shapeValue.shape == currentShape) {
          if(shapeValue.hasOwnProperty('shapeClasses')) {
            shapeClasses = shapeValue.shapeClasses;
          }
        }
      }
    } else {
      console.warn('Shapes not supplied or is empty')
    }

    return shapeClasses;
  }

  /**
   * Function to open or close full screen view of the dashbaord card
   */
  toggleFullScreen(): void {
    /**
     * Change card height when toggling full screen to enable items to stretch accordingly
     */
    if(this.showFullScreen) {
      this.visualizationObject.details.cardHeight = this.cardConfiguration.defaultHeight;
      this.visualizationObject.details.itemHeight = this.cardConfiguration.defaultItemHeight;
    } else {
      this.visualizationObject.details.cardHeight = this.cardConfiguration.fullScreenHeight;
      this.visualizationObject.details.itemHeight = this.cardConfiguration.fullScreenItemHeight;
    }

    this.showFullScreen = !this.showFullScreen;
  }

  updateVisualization(selectedVisualization) {
    this.currentVisualization = selectedVisualization;
  }

  downloadCsv() {
    let data = [
      {
        name: "Test 1",
        age: 13,
        average: 8.2,
        approved: true,
        description: "using 'Content here, content here' "
      },
      {
        name: 'Test 2',
        age: 11,
        average: 8.2,
        approved: true,
        description: "using 'Content here, content here' "
      },
      {
        name: 'Test 4',
        age: 10,
        average: 8.2,
        approved: true,
        description: "using 'Content here, content here' "
      },
    ];

    let options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true
    };
    // new Angular2Csv(data, 'My Report', options);
  }
}
