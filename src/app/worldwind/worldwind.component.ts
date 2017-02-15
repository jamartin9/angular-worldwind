import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuItem, Message } from 'primeng/primeng';
// need typings
declare var WorldWind: any;
/** TODO: cordinate manager, data feed
 * Started: highlighting, Highlighting is intended to be customized through the selector to combine select items into a seperate layer
 *          menu controls, Menu controls are a WIP
 *          drawing tools, The drawing tools are intended to provide point/circle, polygons and cut for holes. Note: needs worth with highligher/selector for combining through layers
 *          Layer Manager, The layer manager is intended to a worldwind layer plus additional data such as time series informatin about the data contained within
 */
@Component({
  selector: 'app-worldwind',
  templateUrl: './worldwind.component.html',
  styleUrls: ['./worldwind.component.css']
})
export class WorldwindComponent {

  // worldwindweb canvas
  @ViewChild('canvas') canvas: ElementRef;

  // worlding window
  private worldwind: any;

  // messages
  private msgs: Message[] = [];

  // layers list for layermanager
  private menuLayers: MenuItem[];

  // TODO: remove label and use layer displayName?
  private layers: [{ layer: any, label: string }];

  constructor() { }

  public getWorldWind() { return this.worldwind; }
  public getCanvas() { return this.canvas.nativeElement; }

  /**
   * Toggles the layer on UI by name, updates components internal layers state
   * Optional: redraw, defaults: true
   */
  public toggleLayer(name: string, redraw = true) {
    for (let l = 0; l < this.layers.length; l++) {
      if (name === this.layers[l].label) {
        if (this.layers[l].layer.enabled) {
          // turn off layer
          this.worldwind.removeLayer(this.layers[l].layer);
          this.layers[l].layer.enabled = false;
          this.worldwind.addLayer(this.layers[l].layer);
          this.redraw(redraw);
          // turn off menu icon
          for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if (this.menuLayers[menuitem].label == 'Layers') {
              for (let item = 0; item < this.menuLayers[menuitem].items.length; item++) {
                if (name === this.menuLayers[menuitem].items[item].label) {
                  this.menuLayers[menuitem].items[item].icon = 'fa-toggle-off';
                  return;
                }
              }
            }

          }
        }
        else {
          // turn on layer
          this.worldwind.removeLayer(this.layers[l].layer);
          this.layers[l].layer.enabled = true;
          this.worldwind.addLayer(this.layers[l].layer);
          this.redraw(redraw);
          // turn on menu icon
          for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if (this.menuLayers[menuitem].label == 'Layers') {
              for (let item = 0; item < this.menuLayers[menuitem].items.length; item++) {
                if (name === this.menuLayers[menuitem].items[item].label) {
                  this.menuLayers[menuitem].items[item].icon = 'fa-toggle-on';
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
   * Add WorldWind Layer with name. No collisions
   * Optional: redraw, defaults: true
   */
  public addLayer(layer: any, name: string, redraw = true) {
    let exists = false;
    for (let i = 0; i < this.layers.length; i++) {
      if (name === this.layers[i].label) {
        // return as layer already exists
        return;
      }
    }
    if (!exists) {
      let enabled = layer.enabled;
      this.worldwind.addLayer(layer);
      this.layers.push({ layer, label: name });
      this.redraw(redraw);
      for (let menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
        if (this.menuLayers[menuitem].label == 'Layers') {
          this.menuLayers[menuitem].items.push({
            label: name,
            icon: 'fa-toggle-on',
            command: (event) => {
              this.toggleLayer(event.item.label);
            }
          });
          return;
        }
      }
    }
  }

  /**
   * remove layer by name
   * Optional: redraw, defaults: true
   */
  public removeLayer(name: string, redraw = true) {
    for (let l = 0; l < this.layers.length; l++) {
      if (name === this.layers[l].label) {
        this.worldwind.removeLayer(this.layers[l].layer);
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

  /**
   * private redraw so control is exposed on per function basis via optional param(s) with common call interface intenally
   */
  private redraw(redraw: boolean) {
    if (redraw) {
      this.worldwind.redraw();
    }
  }

  ngOnInit() {
    // TODO: assign to env var to be configurable from cli 
    WorldWind.configuration.baseUrl = '';
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


    this.menuLayers = [
      {
        label: 'Layers',
        icon: 'fa-globe',
        items: [{
          label: 'New',
          icon: 'fa-plus',
          items: [
            // TODO: implement plus/builder for custom layers
            // optional added layers from remote sources
            { label: 'KML' },
            {
              label: 'BingAerial',
              command: (event) => {
                this.addLayer(new WorldWind.BingAerialWithLabelsLayer(null), "BingAerial");
              }
            },
            // custom polygon layer
            {
              label: 'Other',
              command: (event) => {
                // Create a layer to hold the polygons.
                let polygonsLayer = new WorldWind.RenderableLayer();
                polygonsLayer.displayName = "Polygons";
                this.addLayer(polygonsLayer, "Polygons");

                // Define an outer and an inner boundary to make a polygon with a hole.
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

                let polygonAttributes = new WorldWind.ShapeAttributes(null);
                polygonAttributes.drawInterior = true;
                polygonAttributes.drawOutline = true;
                polygonAttributes.outlineColor = WorldWind.Color.BLUE;
                polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
                polygonAttributes.drawVerticals = polygon.extrude;
                polygonAttributes.applyLighting = true;
                polygon.attributes = polygonAttributes;

                // Create and assign the polygon's highlight attributes.
                let highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
                highlightAttributes.outlineColor = WorldWind.Color.RED;
                highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);
                polygon.highlightAttributes = highlightAttributes;

                // Add the polygon to the layer and the layer to the World Window's layer list.
                polygonsLayer.addRenderable(polygon);

              }
            }
          ]
        },
        // default layers
        {
          label: 'Base',
          icon: 'fa-toggle-off',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        },
        {
          label: 'OneImage',
          icon: 'fa-toggle-on',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        },
        {
          label: 'LandSat',
          icon: 'fa-toggle-off',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        },
        {
          label: 'Compass',
          icon: 'fa-compass',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        },
        {
          label: 'Cordinates',
          icon: 'fa-cog fa-spin fa-fw',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        },
        {
          label: 'ViewControls',
          icon: 'fa-cog fa-spin fa-fw',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        }
        ]
      },
      {
        label: 'Edit',
        icon: 'fa-edit',
        items: [
          // TODO: undo/redo/delete/save
          { label: 'Undo', icon: 'fa-mail-forward' },
          { label: 'Redo', icon: 'fa-mail-reply' },
          { label: 'Delete', icon: 'fa-times-circle' },
          { label: 'Save', icon: 'fa-floppy-o', command: (event) => { this.msgs.push({ severity: 'success', summary: 'Success Message', detail: '!' }); } }
        ]
      },
      {
        // TODO: play/pause
        label: 'Play',
        icon: 'fa-play-circle',
        command: (event) => {
          for (var menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
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
        // TODO: record, inteded for recording from remote feed into layer for later consumption (may involve adding timing data to geo data)
        label: 'Record',
        icon: 'fa-circle',
        command: (event) => {
          for (var menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
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
        icon: 'fa-dot-circle-o'
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

    // add default set of layers
    this.layers = [
      { layer: new WorldWind.BMNGLayer(), label: "Base" },
      { layer: new WorldWind.BMNGOneImageLayer(), label: "OneImage" },
      { layer: new WorldWind.BMNGLandsatLayer(), label: "LandSat" },
      { layer: new WorldWind.CompassLayer(), label: "Compass" },
      { layer: new WorldWind.CoordinatesDisplayLayer(this.worldwind), label: "Cordinates" },
      { layer: new WorldWind.ViewControlsLayer(this.worldwind), label: "ViewControls" }
    ];

    // init layers info
    for (let l = 0; l < this.layers.length; l++) {
      if ("OneImage" === this.layers[l].label
        || "Cordinates" === this.layers[l].label
        || "ViewControls" === this.layers[l].label) {
        this.layers[l].layer.enabled = true;
      } else {
        this.layers[l].layer.enabled = false;
      }
      wwd.addLayer(this.layers[l].layer);
    }

    // Configure the logging level.
    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

  }

}
