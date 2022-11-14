# JSON Forms - More Forms. Less Code

_Complex Forms in the blink of an eye_

JSON Forms eliminates the tedious task of writing fully-featured forms by hand by leveraging the capabilities of JSON, JSON Schema and Javascript.

## Vue 2 Vuetify Renderers WebComponent

This is the JSON Forms Vue 2 Vuetify renderers WebComponent which provides a Vuetify based renderer set for [JSON Forms Vue 2](https://github.com/eclipsesource/jsonforms/blob/master/packages/vue2/vue2) implemented as WebComponent

### Quick start

Use the `vuetify-json-forms` webcomponent in your HTML page as follow.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>vuetify-json-forms demo</title>

    <style>
      /* # =================================================================
        # Global selectors
        # ================================================================= */
      html {
        box-sizing: border-box;
        overflow-y: scroll;
        /* All browsers without overlaying scrollbars */
        -webkit-text-size-adjust: 100%;
        /* Prevent adjustments of font size after orientation changes in iOS */
        word-break: normal;
        -moz-tab-size: 4;
        tab-size: 4;
      }
      
      *,
      ::before,
      ::after {
        background-repeat: no-repeat;
        /* Set background-repeat: no-repeat to all elements and pseudo elements */
        box-sizing: inherit;
      }
      
      ::before,
      ::after {
        text-decoration: inherit;
        /* Inherit text-decoration and vertical align to ::before and ::after pseudo elements */
        vertical-align: inherit;
      }
      
      * {
        padding: 0;
        /* Reset padding and margin of all elements */
        margin: 0;
      }
    </style>    
  </head>
  <body>
    <script type="text/javascript">
      const data = {
        name: 'John Doe',
      };
      const schema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            description: 'Please enter your name',
          },
        },
      };
      const uischema = {
        type: 'VerticalLayout',
        elements: [{ type: 'Control', scope: '#/properties/name' }],
      };
      const uischemas = [];
      const config = {
        restrict: true,
        trim: false,
        showUnfocusedDescription: false,
        hideRequiredAsterisk: true,
      };
      const preset = { theme: { dark: false } };
      const i18n = {};

      const onChange = (event) => {
        let [data] = event.detail;
        console.log('Form state changed:' + JSON.stringify(data));
      };
    </script>

    <vuetify-json-forms id="vuetify-json-forms">
    </vuetify-json-forms>

    <script>
      let form = document.getElementById('vuetify-json-forms');

      form.setAttribute('custom-style', '.v-application--wrap { min-height: 0px; }');
      form.setAttribute('data', JSON.stringify(data));
      form.setAttribute('schema', JSON.stringify(schema));
      form.setAttribute('uischema', JSON.stringify(uischema));
      form.setAttribute('uischemas', JSON.stringify(uischemas));
      form.setAttribute('config', JSON.stringify(config));
      form.setAttribute('locale', 'en');
      form.setAttribute('translations', JSON.stringify(i18n));
      form.setAttribute('default-preset', JSON.stringify(preset));

      form.addEventListener('change', onChange);
    </script>
    <script type="text/javascript" src="vuetify-json-forms.min.js"></script>
  </body>
</html>
```

The above HTML page assumes that `vuetify-json-forms.min.js` is in the same folder.
## License

The JSONForms project is licensed under the MIT License. See the [LICENSE file](https://github.com/eclipsesource/jsonforms/blob/master/LICENSE) for more information.
