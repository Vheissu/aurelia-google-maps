### 1.0.7 (2016-04-14)


#### Bug Fixes

* **all:**
  * numerous linting issues fixed ([533c38d8](http://github.com/Vheissu/aurelia-google-maps/commit/533c38d81a476eb9ca4147e137d7c2bb34510f44))
  * addressing numerous linting errors and warnings ([95c36d70](http://github.com/Vheissu/aurelia-google-maps/commit/95c36d70f5f570f167edc25c7dcdaca846825021))
  * explicitly define dependencies for this plugin ([4a00ceee](http://github.com/Vheissu/aurelia-google-maps/commit/4a00ceee7faa1006965e77524467ecdc3e1132e8))
  * remove event aggregator ([f8510457](http://github.com/Vheissu/aurelia-google-maps/commit/f851045747eb191928b74a0d159357806f0a8d05))
* **dependencies:** fixing up dependencies which were incorrectly defined ([83abc590](http://github.com/Vheissu/aurelia-google-maps/commit/83abc590b57a1a65e4c776aaf6cfcf8456f7e593))
* **element:** add in bindables for ID and tweak logic ([3879541e](http://github.com/Vheissu/aurelia-google-maps/commit/3879541ee8aca717f5e19235b4ee2ba03d792bd1))
* **events:** apply events to random ID element, not viewmodel associated element ([5e7f7eeb](http://github.com/Vheissu/aurelia-google-maps/commit/5e7f7eebf00434f1f60a2bfdf106054e81dff594))
* **jspm:**
  * main file should be index ([e3e86e2b](http://github.com/Vheissu/aurelia-google-maps/commit/e3e86e2bb4b8103655d4dee672def6852a39def5))
  * Fix jspm loader ([c8aff70f](http://github.com/Vheissu/aurelia-google-maps/commit/c8aff70fa78304145635cbbc32645eae9b077896))
* **loader:** use promises to handle loading Google Map and prevent race conditions (untested) ([d90a0736](http://github.com/Vheissu/aurelia-google-maps/commit/d90a0736d6ce7a0199d0d6c361ce634c2e6bcb8d))
* **loading:** fix loading of map to address #5 (#15) ([0751f4fb](http://github.com/Vheissu/aurelia-google-maps/commit/0751f4fba7c84ed1cc9adf64033ae4749bd24b41))
* **maps:** update center method needs to use promise and provide a well-formed object to se ([ff8b6c4a](http://github.com/Vheissu/aurelia-google-maps/commit/ff8b6c4ac30498acfcfe7510d484122eb150877c))
* **style:** missing CSS file added in ([74f87094](http://github.com/Vheissu/aurelia-google-maps/commit/74f87094184c0399ac09a5b3ac0eb6e61b5de3ed))


#### Features

* **address:** geolocate address when using address property ([abc485b0](http://github.com/Vheissu/aurelia-google-maps/commit/abc485b0ebfeb6f4248b57d49537bc5763e6cce2))
* **click:** Added map click event to DOM ([c31dfd90](http://github.com/Vheissu/aurelia-google-maps/commit/c31dfd90b76d1ad122c35b1482b5c74c76fa3082))
* **maps:** when coordinates are supplied, convert them to a well-formed object and then cre ([56cc58d0](http://github.com/Vheissu/aurelia-google-maps/commit/56cc58d05ac39f06d214329ed4565e7f9313fddd))
* **markers:**
  * add the ability to customise map markers a little ([dd3e3776](http://github.com/Vheissu/aurelia-google-maps/commit/dd3e377602f376150c1fefbba2ca896d01e729d2), closes [#7](http://github.com/Vheissu/aurelia-google-maps/issues/7))
  * Implement bindable markers array ([dc288c34](http://github.com/Vheissu/aurelia-google-maps/commit/dc288c34d266c24084e342987cb25ea1eda52dda))


### 1.0.3 (2016-03-08)


Mostly just linting and build process changes. Addressed serious issue of imports for globalResources and styles not being copied over with HTML files.


### 1.0.2 (2016-03-08)


#### Features

* **click:** Added map click event to DOM ([c31dfd90](http://github.com/Vheissu/aurelia-google-maps/commit/c31dfd90b76d1ad122c35b1482b5c74c76fa3082))


### 1.0.1 (2016-03-03)


#### Bug Fixes

* **all:**
  * explicitly define dependencies for this plugin ([4a00ceee](http://github.com/Vheissu/aurelia-google-maps/commit/4a00ceee7faa1006965e77524467ecdc3e1132e8))
  * remove event aggregator ([f8510457](http://github.com/Vheissu/aurelia-google-maps/commit/f851045747eb191928b74a0d159357806f0a8d05))
* **dependencies:** fixing up dependencies which were incorrectly defined ([83abc590](http://github.com/Vheissu/aurelia-google-maps/commit/83abc590b57a1a65e4c776aaf6cfcf8456f7e593))
* **element:** add in bindables for ID and tweak logic ([3879541e](http://github.com/Vheissu/aurelia-google-maps/commit/3879541ee8aca717f5e19235b4ee2ba03d792bd1))
* **events:** apply events to random ID element, not viewmodel associated element ([5e7f7eeb](http://github.com/Vheissu/aurelia-google-maps/commit/5e7f7eebf00434f1f60a2bfdf106054e81dff594))
* **loader:** use promises to handle loading Google Map and prevent race conditions (untested) ([d90a0736](http://github.com/Vheissu/aurelia-google-maps/commit/d90a0736d6ce7a0199d0d6c361ce634c2e6bcb8d))
* **maps:** update center method needs to use promise and provide a well-formed object to se ([ff8b6c4a](http://github.com/Vheissu/aurelia-google-maps/commit/ff8b6c4ac30498acfcfe7510d484122eb150877c))
* **style:** missing CSS file added in ([74f87094](http://github.com/Vheissu/aurelia-google-maps/commit/74f87094184c0399ac09a5b3ac0eb6e61b5de3ed))


#### Features

* **address:** geolocate address when using address property ([abc485b0](http://github.com/Vheissu/aurelia-google-maps/commit/abc485b0ebfeb6f4248b57d49537bc5763e6cce2))
* **maps:** when coordinates are supplied, convert them to a well-formed object and then cre ([56cc58d0](http://github.com/Vheissu/aurelia-google-maps/commit/56cc58d05ac39f06d214329ed4565e7f9313fddd))


## 0.3.0 (2015-08-14)


#### Bug Fixes

* **index:** update to latest configuration api ([44f7a015](http://github.com/aurelia/skeleton-plugin/commit/44f7a015c0f15251bd07b327e42c875eaccbb735))


### 0.2.1 (2015-07-07)


## 0.2.0 (2015-06-08)


#### Bug Fixes

* **all:**
  * update to latest plugin api ([a050d736](http://github.com/aurelia/skeleton-plugin/commit/a050d736d32811066ffa902615cc73e1a5cbb6e3))
  * update compiler ([faf51acc](http://github.com/aurelia/skeleton-plugin/commit/faf51accc1514c6767eaed60df16dd3d586b5cc5))


#### Features

* **all:** initial commit of skeleton ([51a036d1](http://github.com/aurelia/skeleton-plugin/commit/51a036d146750a0bafd443dbc3def51ef7f89f6e))
