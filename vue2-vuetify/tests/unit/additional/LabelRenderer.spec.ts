import { clearAllIds } from '@jsonforms/core';
import { Wrapper } from '@vue/test-utils';
import LabelRenderer, {
  entry as labelRendererEntry,
} from '../../../src/additional/LabelRenderer.vue';
import { mountJsonForms } from '../util';

const renderers = [labelRendererEntry];

describe('LabelRenderer.vue', () => {
  const data = '';

  const schema = {
    type: 'string',
  };
  const uischema = {
    type: 'Label',
    text: 'My Label',
  };

  let wrapper: Wrapper<any, Element>;

  beforeEach(() => {
    // clear all ids to guarantee that the snapshots will always be generated with the same ids
    clearAllIds();
    wrapper = mountJsonForms(data, schema, renderers, uischema);
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('check if child LabelRenderer exists', () => {
    expect(wrapper.getComponent(LabelRenderer));
  });

  it('renders a label', () => {
    expect(wrapper.find('label').exists()).toBe(true);
  });

  it('renders label text', () => {
    expect(wrapper.find('label').text()).toEqual('My Label');
  });

  it('should render component and match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
