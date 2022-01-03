<template>
  <v-container fluid class="demo">
    <v-flex>
      <v-card height="300">
        <v-card-text> here designerView </v-card-text>

        <v-row no-gutters>
          <!-- <v-col v-for="n in 3" :key="n" cols="12" sm="4"> -->
          <v-col cols="12" sm="1">
            <!-- <v-card class="pa-2" outlined tile> One of three columns </v-card> -->
            <v-icon>mdi-form-textbox</v-icon>
            <v-divider></v-divider>
            <v-icon>mdi-form-textarea</v-icon>
            <v-divider></v-divider>
            <v-icon>mdi-form-dropdown</v-icon>
          </v-col>

          <v-col cols="12" sm="10">
            <v-card class="pa-2" outlined tile>
              <v-card-text>
                <v-text-field label="Regular"></v-text-field>
                <v-fab-transition>
                  <v-btn
                    v-show="!hidden"
                    color="blue"
                    dark
                    absolute
                    button
                    right
                    x-small
                    fab
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </v-fab-transition>
              </v-card-text>
            </v-card>

            <v-card class="pa-2" outlined tile>
              <v-card-text>
                <v-textarea
                  name="input-7-1"
                  label="Default style"
                  value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."
                  hint="Hint text"
                ></v-textarea>
                <v-fab-transition>
                  <v-btn
                    v-show="!hidden"
                    color="blue"
                    dark
                    absolute
                    button
                    right
                    x-small
                    fab
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </v-fab-transition>
              </v-card-text>
            </v-card>

            <v-card class="pa-2" outlined tile>
              <v-card-text>
                <v-select :items="items" label="Standard"></v-select>
                <v-fab-transition>
                  <v-btn
                    v-show="!hidden"
                    color="blue"
                    dark
                    absolute
                    button
                    right
                    x-small
                    fab
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </v-fab-transition>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- <v-app-bar app clipped-right clipped-left flat> test </v-app-bar> -->
        <!-- <v-toolbar dense> </v-toolbar> -->
        <!-- hola -->
      </v-card>
      <!-- <v-container class="grey lighten-5" fluid height="300">
        here designerView
      </v-container> -->
    </v-flex>
  </v-container>
</template>

<script lang="ts">
export default {
  name: 'DesignerView',
  data() {
    return {
      activeTab: 0,
      title: 'Designer',
      items: [
        { text: 'Arial' },
        { text: 'Calibri' },
        { text: 'Courier' },
        { text: 'Verdana' },
      ],
      dropdown_edit: [
        { text: '100%' },
        { text: '75%' },
        { text: '50%' },
        { text: '25%' },
        { text: '0%' },
      ],
      toggle_exclusive: 2,
      toggle_multiple: [1, 2, 3],
    };
  },
};
</script>

<style scoped>
/* .form {
  max-width: 500px;
  flex: 1;
}
.container {
  display: flex;
}
.data {
  flex: 1;
}

.demo {
  max-width: 1200px;
} */
</style>

<style>
/* required class */
.code-editor {
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}

.vue-code-hightlight pre {
  background-color: transparent !important;
}

.vue-code-hightlight pre code {
  background-color: transparent !important;
}
</style>
