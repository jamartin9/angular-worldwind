# AngularWorldwind
https://spaz.gitlab.io/angular-worldwind/

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.31.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to GitLab Pages
Replace `GITLAB_USER` and `GITLAB_PROJECT` with the your gitlab username and gitlab project name
Add the following content in .gitlab-ci.yml
```
image: node:latest

pages:
  stage: deploy
  script:
  - npm install
  - node ./node_modules/@angular/cli/bin/ng build --aot=true --environment=prod --sourcemap=false --base-href="https://GITLAB_USER.gitlab.io/GITLAB_PROJECT/"
  artifacts:
    paths:
    - public
  only:
  - master
```

Replace `dist` path for `outDir` in `angular-cli.json` and `tsconfig.json` with `public` for gitlab


## Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Goals

Reuseable WorldWindWeb Angular 2+ component with mobile support

Provide:
1. Worldwind layer management along with time data about the layer ( ie when shapes occurened )
2. Highlighting amongst layers with selection of shapes
3. 3D Drawing tools for point/circle/polygon with cut
4. Save, Delete, Undo, Redo
5. DVR Controls for layers
6. Import of KML/GeoJSON/Internal formats
7. Streaming of data through WebSockets/KML_NETWORK_LINKS/ProvidedProducers
8. Controls for the above functionality