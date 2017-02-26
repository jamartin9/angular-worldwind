import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem, Message } from 'primeng/primeng';
import { environment } from '../../environments/environment';

// TODO: need typings
declare let WorldWind: any;

@Component({
  selector: 'app-worldwind',
  templateUrl: './worldwind.component.html',
  styleUrls: ['./worldwind.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldwindComponent {
  @ViewChild('canvas') canvas: ElementRef;
  private displayTextInput: boolean = false;
  private displayDialog: boolean = false;
  private deleteLayer: boolean = false;
  private nameInput: string;
  private worldwind: any = null;
  private msgs: Message[] = [];
  private menuLayers: MenuItem[];
  constructor() { }
  public getWorldWind() { return this.worldwind; }
  public getCanvas() { return this.canvas.nativeElement; }
  public addMessage(message: Message) { this.msgs.push(message); }

  /**
   * Toggles layer by name
   */
  public toggleLayer(name: string, redraw = true) {
    // toggle worldwind layer
    if (this.worldwind) {
      for (let l = 0; l < this.worldwind.layers.length; l++) {
        if (name === this.worldwind.layers[l].displayName) {
          let wasEnabled = false;
          if (this.worldwind.layers[l].enabled) {
            wasEnabled = true;
            this.worldwind.layers[l].enabled = false;
          }
          else {
            this.worldwind.layers[l].enabled = true;
          }
          // toggle menu icon
          for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if (this.menuLayers[menuitem].label == 'Layers') {
              for (let item = 0; item < this.menuLayers[menuitem].items.length; item++) {
                if (name === this.menuLayers[menuitem].items[item].label) {
                  if (wasEnabled) {
                    this.menuLayers[menuitem].items[item].icon = 'fa-toggle-off';
                  } else {
                    this.menuLayers[menuitem].items[item].icon = 'fa-toggle-on';
                  }
                  this.redraw(redraw);
                  return;
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Adds worldwind layer and menu item
   */
  public addLayer(layer: any, redraw = true, overwrite = false, ) {
    if (!this.worldwind) {
      this.makewwd();
    }
    if (!overwrite) {
      for (let i = 0; i < this.worldwind.layers.length; i++) {
        if (layer.displayName === this.worldwind.layers[i].displayName) {
          return;
        }
      }
    }
    let enabled = layer.enabled;
    this.worldwind.addLayer(layer);
    this.redraw(redraw);
    for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
      if (this.menuLayers[menuitem].label == 'Layers') {
        this.menuLayers[menuitem].items.push({
          label: layer.displayName,
          icon: 'fa-toggle-on',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        });
        return;
      }
    }

  }

  /**
   * remove layer by name
   */
  public removeLayer(name: string, redraw = true) {
    if (this.worldwind) {
      for (let l = 0; l < this.worldwind.layers.length; l++) {
        if (name === this.worldwind.layers[l].displayName) {
          this.worldwind.removeLayer(this.worldwind.layers[l]);
          this.redraw(redraw);
          for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if (this.menuLayers[menuitem].label == 'Layers') {
              for (let item = 0; item < this.menuLayers[menuitem].items.length; item++) {
                if (name === this.menuLayers[menuitem].items[item].label) {
                  this.menuLayers[menuitem].items.splice(item, 1);
                  return;
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * private redraw 
   * control is exposed on per function basis via optional param(s)
   * keeps common call interface intenally for mulitple worldwind operations
   */
  private redraw(redraw: boolean) {
    if (redraw) {
      this.worldwind.redraw();
    }
  }

  /**
   * Get input from text in dialog and toggles display
   */
  private toggleTextInput() {
    if (this.displayTextInput) {
      this.displayTextInput = false;
      if (this.nameInput) {
        if (this.deleteLayer) {
          this.deleteLayer = false;
          this.removeLayer(this.nameInput);
          this.addMessage({ severity: 'error', summary: 'deleteLayer Message', detail: '!' });
        } else {
          let userLayer = new WorldWind.RenderableLayer();
          userLayer.displayName = this.nameInput;
          this.addLayer(userLayer);
          this.addMessage({ severity: 'success', summary: 'Save Message', detail: '!' });
        }
        this.nameInput = "";
      }
    } else {
      this.displayTextInput = true;
    }

  }

  /**
   * Toggels dialogs
   */
  private toggleDialog() {
    // turn off dialog
    if (this.displayDialog) {
      this.displayDialog = false;
    } else {
      this.displayDialog = true;
    }
  }

  /**
   * creates worldwind viewer and config
   */
  private makewwd() {
    //WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);
    WorldWind.configuration.baseUrl = environment.worldwindconfigurl;
    // create worldwind
    let wwd = new WorldWind.WorldWindow('canvas');
    this.worldwind = wwd;
    let highlighter = new WorldWind.HighlightController(wwd);

    // The common gesture-handling function.
    let handleClick = (recognizer) => {
      // Obtain the event location.
      let x = recognizer.clientX,
        y = recognizer.clientY;

      // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
      // relative to the upper left corner of the canvas rather than the upper left corner of the page.
      let pickList = wwd.pick(wwd.canvasCoordinates(x, y));

      // If only one thing is picked and it is the terrain, tell the world window to go to the picked location.
      if (pickList.objects.length == 1 && pickList.objects[0].isTerrain) {
        let position = pickList.objects[0].position;
        wwd.goTo(new WorldWind.Location(position.latitude, position.longitude));
      }
    };

    // Listen for mouse clicks.
    let clickRecognizer = new WorldWind.ClickRecognizer(wwd, handleClick);

    // Listen for taps on mobile devices.
    let gotoRecognizer = new WorldWind.TapRecognizer(wwd, handleClick);

    // Now set up to handle picking.
    let highlightedItems = [];

    // The common pick-handling function.
    let handlePick = (o) => {
      // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
      // the mouse or tap location.
      let x = o.clientX,
        y = o.clientY;

      let redrawRequired = highlightedItems.length > 0; // must redraw if we de-highlight previously picked items

      // De-highlight any previously highlighted placemarks.
      for (let h = 0; h < highlightedItems.length; h++) {
        highlightedItems[h].highlighted = false;
      }
      highlightedItems = [];

      // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
      // relative to the upper left corner of the canvas rather than the upper left corner of the page.
      let rectRadius = 50,
        pickPoint = wwd.canvasCoordinates(x, y),
        pickRectangle = new WorldWind.Rectangle(pickPoint[0] - rectRadius, pickPoint[1] + rectRadius,
          2 * rectRadius, 2 * rectRadius);

      let pickList = wwd.pickShapesInRegion(pickRectangle);
      if (pickList.objects.length > 0) {
        redrawRequired = true;
      }

      // Highlight the items picked.
      if (pickList.objects.length > 0) {
        for (let p = 0; p < pickList.objects.length; p++) {
          if (pickList.objects[p].isOnTop) {
            pickList.objects[p].userObject.highlighted = true;
            highlightedItems.push(pickList.objects[p].userObject);
          }
        }
      }

      // Update the window if we changed anything.
      if (redrawRequired) {
        wwd.redraw(); // redraw to make the highlighting changes take effect on the screen
      }
    };

    // Listen for mouse moves and highlight the placemarks that the cursor rolls over.
    wwd.addEventListener("mousemove", handlePick);

    // Listen for taps on mobile devices and highlight the placemarks that the user taps.
    let tapRecognizer = new WorldWind.TapRecognizer(wwd, handlePick);

  }

  // init menu items
  ngOnInit() {
    this.menuLayers = [
      {
        label: 'Layers',
        icon: 'fa-globe',
        items: [{
          label: 'New',
          icon: 'fa-plus',
          items: [
            // optional added layers from remote sources
            {
              label: 'KML',
              command: () => {
                let polygonsLayer = new WorldWind.RenderableLayer();
                polygonsLayer.displayName = "Polygons";
                this.addLayer(polygonsLayer);

                let boundaries = [];
                boundaries[0] = []; // outer boundary
                boundaries[0].push(new WorldWind.Position(40, -100, 1e5));
                boundaries[0].push(new WorldWind.Position(45, -110, 1e5));
                boundaries[0].push(new WorldWind.Position(40, -120, 1e5));
                boundaries[1] = []; // inner boundary
                boundaries[1].push(new WorldWind.Position(41, -103, 1e5));
                boundaries[1].push(new WorldWind.Position(44, -110, 1e5));
                boundaries[1].push(new WorldWind.Position(41, -117, 1e5));

                // Create the polygon and assign its attributes.

                let polygon = new WorldWind.Polygon(boundaries, null);
                polygon.altitudeMode = WorldWind.ABSOLUTE;
                polygon.extrude = true; // extrude the polygon edges to the ground
                polygon.userProperties = { name: "UniquelyNamedPolygon", time: "12:00am" };

                let polygonAttributes = new WorldWind.ShapeAttributes(null);
                polygonAttributes.drawInterior = true;
                polygonAttributes.drawOutline = true;
                polygonAttributes.outlineColor = WorldWind.Color.BLUE;
                polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
                polygonAttributes.drawVerticals = polygon.extrude;
                polygonAttributes.applyLighting = true;
                polygon.attributes = polygonAttributes;

                let highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
                highlightAttributes.outlineColor = WorldWind.Color.RED;
                highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);
                polygon.highlightAttributes = highlightAttributes;

                // Add the polygon to the layer and the layer to the World Window's layer list.
                polygonsLayer.addRenderable(polygon);
                let location = new WorldWind.Location(39, -84);
                let size = 500;
                let meters = size * 1000;
                let circle = new WorldWind.SurfaceEllipse(location, meters, meters, 0, polygonAttributes);
                console.log(circle.computeBoundaries(this.worldwind));
                circle.highlightAttributes = highlightAttributes;
                polygonsLayer.addRenderable(circle);

              }
            },
            {
              label: 'BingAerial',
              command: (event) => {
                this.addLayer(new WorldWind.BingAerialWithLabelsLayer(null));
              }
            },
            {
              label: 'Blue Marble',
              command: (event) => {
                this.addLayer(new WorldWind.BMNGLayer());
              }
            },
            {
              label: 'Blue Marble Image',
              command: (event) => {
                this.addLayer(new WorldWind.BMNGOneImageLayer());
              }
            },
            {
              label: 'Blue Marble & Landsat',
              command: (event) => {
                this.addLayer(new WorldWind.BMNGLandsatLayer());
              }
            },
            {
              label: 'Compass',
              icon: 'fa-compass',
              command: (event) => {
                this.addLayer(new WorldWind.CompassLayer());
              }
            },
            {
              label: 'Coordinates',
              icon: 'fa-cog fa-spin fa-fw',
              command: (event) => {
                this.addLayer(new WorldWind.CoordinatesDisplayLayer(this.worldwind));
              }
            },
            {
              label: 'View Controls',
              icon: 'fa-cog fa-spin fa-fw',
              command: (event) => {
                this.addLayer(new WorldWind.ViewControlsLayer(this.worldwind));
              }
            },
            {
              label: 'Other',
              command: (event) => {
                // show user input for name
                this.toggleDialog();
                this.toggleTextInput();
              }
            }
          ]
        },
          // default layers

        ]
      },
      {
        label: 'Edit',
        icon: 'fa-edit',
        items: [
          // TODO: undo/redo/deleteLayer/save
          { label: 'Undo', icon: 'fa-mail-forward', command: (event) => { this.addMessage({ severity: 'warn', summary: 'Undo Message', detail: '!' }); } },
          { label: 'Redo', icon: 'fa-mail-reply', command: (event) => { this.addMessage({ severity: 'info', summary: 'Redo Message', detail: '!' }); } },
          {
            label: 'Delete', icon: 'fa-times-circle', command: (event) => {
              this.deleteLayer = true;
              this.displayTextInput = true;
              this.toggleDialog();
            }
          },
          {
            label: 'Save', icon: 'fa-floppy-o', command: (event) => {
              this.displayTextInput = true;
              this.toggleDialog();
            }
          }
        ]
      },
      {
        // TODO: play/pause
        label: 'Play',
        icon: 'fa-play-circle',
        command: (event) => {
          for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if ('Play' === this.menuLayers[menuitem].label) {
              if ('fa-play-circle' === this.menuLayers[menuitem].icon) {
                this.menuLayers[menuitem].icon = 'fa-pause';
              } else {
                this.menuLayers[menuitem].icon = 'fa-play-circle';
              }
              return;
            }
          }
        }
      },
      {
        // TODO: record, inteded for recording from feed into layer for later consumption
        label: 'Record',
        icon: 'fa-circle',
        command: (event) => {
          for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if ('Record' === this.menuLayers[menuitem].label) {
              if ('fa-circle' === this.menuLayers[menuitem].icon) {
                this.menuLayers[menuitem].icon = 'fa-spinner fa-pulse fa-fw';
              } else {
                this.menuLayers[menuitem].icon = 'fa-circle';
              }
              return;
            }
          }
        }
      },
      {
        // TODO: back
        icon: 'fa-step-backward'
      },
      {
        // TODO: forward
        icon: 'fa-step-forward'
      },
      {
        // TODO: circle
        icon: 'fa-circle-o'
      },
      {
        // TODO: polygon
        icon: 'fa-dot-circle-o',
        command: (event) => {
          let surfacepolygonsLayer = new WorldWind.RenderableLayer();
          surfacepolygonsLayer.displayName = "SurfacePolygons";
          this.addLayer(surfacepolygonsLayer);
          let surfacepolygonAttributes = new WorldWind.ShapeAttributes(null);
          surfacepolygonAttributes.drawInterior = true;
          surfacepolygonAttributes.drawOutline = true;
          surfacepolygonAttributes.outlineColor = WorldWind.Color.BLUE;
          surfacepolygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
          surfacepolygonAttributes.applyLighting = false;
          surfacepolygonAttributes.drawVerticals = true;

          let highlightAttributes = new WorldWind.ShapeAttributes(surfacepolygonAttributes);
          highlightAttributes.outlineColor = WorldWind.Color.RED;
          highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);

          var surfacepoly = [];
          surfacepoly[0] = []; // outer boundary
          surfacepoly[0].push(new WorldWind.Location(20, -70));
          surfacepoly[0].push(new WorldWind.Location(25, -80));
          surfacepoly[0].push(new WorldWind.Location(20, -90));
          surfacepoly[1] = []; // inner boundary
          surfacepoly[1].push(new WorldWind.Location(21, -73));
          surfacepoly[1].push(new WorldWind.Location(24, -80));
          surfacepoly[1].push(new WorldWind.Location(21, -87));

          let shape = new WorldWind.SurfacePolygon(surfacepoly, surfacepolygonAttributes);
          shape.highlightAttributes = highlightAttributes;
          surfacepolygonsLayer.addRenderable(shape);
        }
      },
      {
        // TODO: cut
        icon: 'fa-crop'
      },
      {
        // TODO: picket
        icon: 'fa-hand-o-up'
      },
      {
        // TODO: metrics dashboard, intended for router link
        icon: 'fa-tachometer'
      },
      {
        // TODO: toggle menubar with gesture retrieval
        icon: 'fa-minus'
      }
    ];

  }

}
