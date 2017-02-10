import { Component, OnInit, ViewChild } from '@angular/core';

declare var WorldWind:any;

// TODO: add a spinny for loading
//       add types for worldwind
//       gesture control button toggle

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  // worldwindweb canvas
  @ViewChild('canvas') canvas;
  // worlding window
  private worldwind: any;
  // menu toggle
  private showButton:boolean;
  // layers list for layermanager
  private layers: [{layer:any, enabled:boolean, name:String}];
  constructor(){}
  public getWorldWind():any {return this.worldwind;}
  public showMenu(){this.showButton = true;}
  public hideMenu(){this.showButton = false;}
  public getCanvas(){return this.canvas.nativeElement};

/**
 * Toggles the layer on UI by name, updates components internal layers state
 * Optional: redraw, defaults: true
 */
  public toggleLayer(name:String, redraw = true){
    for (var l = 0; l < this.layers.length; l++) {
      if( name === this.layers[l].name){
        if(this.layers[l].enabled){
          this.worldwind.removeLayer(this.layers[l].layer);
          this.layers[l].enabled = false;
          this.layers[l].layer.enabled = false;
          this.worldwind.addLayer(this.layers[l].layer);
          this.redraw(redraw);
        }
        else{
          this.worldwind.removeLayer(this.layers[l].layer);
          this.layers[l].enabled = true;
          this.layers[l].layer.enabled = true;
          this.worldwind.addLayer(this.layers[l].layer);
          this.redraw(redraw);
        }
      }
    }
  }

/**
 * Add WorldWind Layer with name
 * Optional: redraw, defaults: true
 */
  public addLayer(layer: any, name:String, redraw = true){
    let enabled = layer.enabled;
    this.worldwind.addLayer(layer);
    this.layers.push( { layer, enabled, name} );
    this.redraw(redraw);
  }

/**
 * remove layer by name
 * Optional: redraw, defaults: true
 */
  public removeLayer(name: String, redraw = true){
    for (var l = 0; l < this.layers.length; l++) {
        if( name === this.layers[l].name){
          this.worldwind.removeLayer(this.layers[l].layer);
          this.redraw(redraw);
        }
    }
  }

/**
 * private redraw so control is exposed on per function basis via optional param(s)
 */
  private redraw(redraw:boolean){
    if(redraw){
      this.worldwind.redraw();
    }
  }

  ngOnInit() {
    //this.showButton = false;
    this.showButton = true;

    // create worldwind
    this.worldwind = new WorldWind.WorldWindow('canvas');

    // add default set of layers
    this.layers = [
      {layer: new WorldWind.BMNGLayer(), enabled: false, name: "Base"},
      {layer: new WorldWind.BMNGOneImageLayer(), enabled: true, name: "OneImage"},
      {layer: new WorldWind.BMNGLandsatLayer(), enabled: false, name: "LandSat"},
      {layer: new WorldWind.CompassLayer(), enabled: true, name: "Compass"},
      {layer: new WorldWind.CoordinatesDisplayLayer(this.worldwind), enabled: true, name: "Cordinates"},
      {layer: new WorldWind.ViewControlsLayer(this.worldwind), enabled: true, name: "ViewControls"}
    ];

    // init layers info
    for (var l = 0; l < this.layers.length; l++) {
      this.layers[l].layer.enabled = this.layers[l].enabled;
      this.worldwind.addLayer(this.layers[l].layer);
    }

    // Configure the logging level.
    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

    // Configure the amount of GPU memory to use.
    WorldWind.configuration.gpuCacheSize = 500e6; // 500 MB

  }

}
