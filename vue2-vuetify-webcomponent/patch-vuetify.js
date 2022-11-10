const fs = require('fs');
const glob = require('glob');
const replace = require('replace-in-file');

glob(
  '../node_modules/vuetify/lib/mixins/detachable/index.js',
  null,
  (err, files) => {
    if (err) {
      return console.error(err);
    } else {
      replace(
        {
          files,
          from: "target = document.querySelector('[data-app]');",
          to: "target = this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector('[data-app]') : document.querySelector('[data-app]');",
        },
        (err, results) => {
          if (err) {
            return console.error(err);
          }
        }
      );
      replace(
        {
          files,
          from: 'target = document.querySelector(this.attach);',
          to: 'target = this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector(this.attach) : document.querySelector(this.attach);',
        },
        (err, results) => {
          if (err) {
            return console.error(err);
          }
        }
      );
    }
  }
);

glob(
  '../node_modules/vuetify/lib/mixins/overlayable/index.js',
  null,
  (err, files) => {
    if (err) {
      return console.error(err);
    } else {
      replace(
        {
          files,
          from: "const parent = this.absolute ? this.$el.parentNode : document.querySelector('[data-app]');",
          to: "const parent = this.absolute ? this.$el.parentNode : this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector('[data-app]') : document.querySelector('[data-app]');",
        },
        (err, results) => {
          if (err) {
            return console.error(err);
          }
        }
      );
    }
  }
);

glob(
  '../node_modules/vuetify/lib/components/VSlider/VSlider.js',
  null,
  (err, files) => {
    if (err) {
      return console.error(err);
    } else {
      replace(
        {
          files,
          from: "this.app = document.querySelector('[data-app]')",
          to: "this.app = (this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector('[data-app]') : document.querySelector('[data-app]'))",
        },
        (err, results) => {
          if (err) {
            return console.error(err);
          }
        }
      );
    }
  }
);
