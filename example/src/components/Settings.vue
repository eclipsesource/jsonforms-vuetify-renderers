<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { useTheme } from 'vuetify';
import { computed } from 'vue';

const appStore = useAppStore();
const theme = useTheme();

const validationModes = [
  { text: 'Validate And Show', value: 'ValidateAndShow' },
  { text: 'Validate And Hide', value: 'ValidateAndHide' },
  { text: 'No Validation', value: 'NoValidation' },
];

const locales = [
  { text: 'English (en)', value: 'en' },
  { text: 'German (de)', value: 'de' },
  { text: 'Bulgarian (bg)', value: 'bg' },
  { text: 'Browser Language', value: navigator.language },
];

const breakHorizontals = [
  { text: 'None', value: false },
  { text: 'xs', value: 'xs' },
  { text: 'sm', value: 'sm' },
  { text: 'md', value: 'md' },
  { text: 'lg', value: 'lg' },
  { text: 'xl', value: 'xl' },
];
</script>

<template>
  <v-navigation-drawer
    v-model="appStore.settings"
    :right="!appStore.rtl"
    :location="appStore.rtl ? 'left' : 'right'"
    temporary
    width="300"
  >
    <v-toolbar flat>
      <v-toolbar-title>Settings</v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-btn icon @click="appStore.settings = false">
          <v-icon>$close</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-divider />

    <v-container>
      <v-row><v-col>Theme</v-col></v-row>
      <v-row>
        <v-col>
          <v-btn-toggle
            v-model="appStore.dark"
            borderless
            mandatory
            group
            color="primary"
            style="display: grid; grid-template-columns: 1fr 1fr"
          >
            <v-btn :value="false">
              <span class="hidden-sm-and-down">Light</span>

              <v-icon right> mdi-weather-sunny </v-icon>
            </v-btn>

            <v-btn :value="true">
              <span class="hidden-sm-and-down">Dark</span>

              <v-icon right> mdi-weather-night </v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container>
      <v-row><v-col>Direction</v-col></v-row>
      <v-row>
        <v-col>
          <v-btn-toggle
            v-model="appStore.rtl"
            borderless
            mandatory
            group
            color="primary"
            style="display: grid; grid-template-columns: 1fr 1fr"
          >
            <v-btn :value="false">
              <span class="hidden-sm-and-down">LTR</span>

              <v-icon right> mdi-format-textdirection-l-to-r</v-icon>
            </v-btn>

            <v-btn :value="true">
              <span class="hidden-sm-and-down">RTL</span>

              <v-icon right> mdi-format-textdirection-r-to-l </v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container>
      <v-row><v-col>Validation</v-col></v-row>
      <v-row>
        <v-col>
          <v-select
            attach
            outlined
            persistent-hint
            dense
            v-model="appStore.jsonforms.validationMode"
            :items="validationModes"
            item-title="text"
            item-value="value"
          ></v-select>
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container>
      <v-row><v-col>Locale (Mostly in basic example)</v-col></v-row>
      <v-row>
        <v-col>
          <v-select
            outlined
            persistent-hint
            dense
            v-model="appStore.jsonforms.locale"
            :items="locales"
            item-title="text"
            item-value="value"
          ></v-select>
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container>
      <v-row><v-col>Options</v-col></v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.config.hideRequiredAsterisk"
                label="Hide Required Asterisk"
                v-bind="props"
              ></v-switch>
            </template>
            If asterisks in labels for required fields should be hidden
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.config.showUnfocusedDescription"
                label="Show Unfocused Description"
                v-bind="props"
              ></v-switch>
            </template>
            If input descriptions should hide when not focused
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.config.restrict"
                label="Restrict"
                v-bind="props"
              ></v-switch>
            </template>
            Whether to restrict the number of characters to maxLength, if
            specified in the JSON schema
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.readonly"
                label="Read-Only"
                v-bind="props"
              ></v-switch>
            </template>
            If true, sets all controls to read-only
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.config.collapseNewItems"
                label="Collapse new array items"
                v-bind="props"
              ></v-switch>
            </template>
            If true, new array items are not expanded by default
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.config.hideArraySummaryValidation"
                label="Hide array summary validation"
                v-bind="props"
              ></v-switch>
            </template>
            If true, the summary of validation errors in arrays is hidden
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.config.initCollapsed"
                label="Collapse arrays initially"
                v-bind="props"
              ></v-switch>
            </template>
            If true, arrays are not expanded initially
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-switch
                v-model="appStore.jsonforms.config.hideAvatar"
                label="Hide Array Item Avatar"
                v-bind="props"
              ></v-switch>
            </template>
            Whether the array index avatars shall be shown
          </v-tooltip>
        </v-col>
      </v-row>
      <v-container>
        <v-row>
          <v-row><v-col>Break horizontal layouts</v-col></v-row>
          <v-col>
            <v-select
              outlined
              persistent-hint
              dense
              v-model="appStore.jsonforms.config.breakHorizontal"
              :items="breakHorizontals"
              item-title="text"
              item-value="value"
            ></v-select>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <v-divider />
  </v-navigation-drawer>
</template>
