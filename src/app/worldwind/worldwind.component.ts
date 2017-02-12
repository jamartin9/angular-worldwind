import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, Message } from 'primeng/primeng';
declare var WorldWind: any;

@Component({
  selector: 'app-worldwind',
  templateUrl: './worldwind.component.html',
  styleUrls: ['./worldwind.component.css']
})
export class WorldwindComponent implements OnInit {

  // worldwindweb canvas
  @ViewChild('canvas') canvas;

  // worlding window
  private worldwind: any;

  // messages
  msgs: Message[] = [];

  // layers list for layermanager
  private menuLayers: MenuItem[];
  private layers: [{ layer: any, label: string }];

  constructor() { }

  public getWorldWind(): any { return this.worldwind; }
  public getCanvas() { return this.canvas.nativeElement };

  /**
   * Toggles the layer on UI by name, updates components internal layers state
   * Optional: redraw, defaults: true
   */
  public toggleLayer(name: string, redraw = true) {
    for (var l = 0; l < this.layers.length; l++) {
      if (name === this.layers[l].label) {
        if (this.layers[l].layer.enabled) {
          // turn off layer
          this.worldwind.removeLayer(this.layers[l].layer);
          this.layers[l].layer.enabled = false;
          this.worldwind.addLayer(this.layers[l].layer);
          this.redraw(redraw);
          // turn off menu icon
          for (var menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if (this.menuLayers[menuitem].label == 'Layers') {
              for (var item = 0; item < this.menuLayers[menuitem].items.length; item++) {
                if (name === this.menuLayers[menuitem].items[item].label) {
                  this.menuLayers[menuitem].items[item].icon = 'fa-toggle-off';
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
          for (var menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
            if (this.menuLayers[menuitem].label == 'Layers') {
              for (var item = 0; item < this.menuLayers[menuitem].items.length; item++) {
                if (name === this.menuLayers[menuitem].items[item].label) {
                  this.menuLayers[menuitem].items[item].icon = 'fa-toggle-on';
                }
              }
            }
          }

        }
      }
    }
  }

  /**
   * Add WorldWind Layer with name
   * Optional: redraw, defaults: true
   */
  public addLayer(layer: any, name: string, redraw = true) {
    let enabled = layer.enabled;
    this.worldwind.addLayer(layer);
    this.layers.push({ layer, label: name });
    this.redraw(redraw);
    for (var menuitem = 0; menuitem < this.menuLayers.length; menuitem++) {
      if (this.menuLayers[menuitem].label == 'Layers') {
        this.menuLayers[menuitem].items.push({
          label: name,
          icon: 'fa-toggle-on',
          command: (event) => {
            this.toggleLayer(event.item.label);
          }
        });
      }
    }
  }

  /**
   * remove layer by name
   * Optional: redraw, defaults: true
   */
  public removeLayer(name: string, redraw = true) {
    for (var l = 0; l < this.layers.length; l++) {
      if (name === this.layers[l].label) {
        this.worldwind.removeLayer(this.layers[l].layer);
        this.redraw(redraw);
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
    // create worldwind
    this.worldwind = new WorldWind.WorldWindow('canvas');
    this.menuLayers = [
      {
        label: 'Layers',
        icon: 'fa-globe',
        items: [{
          label: 'New',
          icon: 'fa-plus',
          items: [
            // TODO: implement plus/builder for custom layers
            { label: 'KML' },
            {
              label: 'Other',
              command: (event) => {
                this.addLayer(new WorldWind.BingAerialWithLabelsLayer(null), "BingAerial");
              }
            }
          ]
        },
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
          // TODO: undo/redo
          { label: 'Undo', icon: 'fa-mail-forward' },
          { label: 'Redo', icon: 'fa-mail-reply' }
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
            }
          }
        }
      },
      {
        // TODO: record
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
            }
          }
        }
      },
      {
        // TODO: back
        icon: 'fa-step-backward',
        command: (event) => {

        }
      },
      {
        // TODO: forward
        icon: 'fa-step-forward',
        command: (event) => {

        }
      },
      {
        // TODO: save
        icon: 'fa-floppy-o',
        command: (event) => {
          this.msgs.push({ severity: 'success', summary: 'Success Message', detail: '!' });
        }
      },
      {
        // TODO: circle
        icon: 'fa-circle-o',
        command: (event) => {
        }
      },
      {
        // TODO: polygon
        icon: 'fa-dot-circle-o',
        command: (event) => {
        }
      },
      {
        // TODO: cut
        icon: 'fa-crop',
        command: (event) => {
        }
      },
      {    
        // TODO: metrics dashboard
        icon: 'fa-tachometer',
        command: (event) => {
        }
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
    for (var l = 0; l < this.layers.length; l++) {
      if ("OneImage" === this.layers[l].label
        || "Cordinates" === this.layers[l].label
        || "ViewControls" === this.layers[l].label) {
        this.layers[l].layer.enabled = true;
      } else {
        this.layers[l].layer.enabled = false;
      }
      this.worldwind.addLayer(this.layers[l].layer);
    }

    // Configure the logging level.
    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

    // Configure the amount of GPU memory to use.
    WorldWind.configuration.gpuCacheSize = 500e6; // 500 MB

  }

}
