import { clearAllIds } from '@jsonforms/core';
import { Wrapper } from '@vue/test-utils';
import EnumControlRenderer, {
  entry as enumControlRendererEntry,
} from '../../../src/controls/EnumControlRenderer.vue';
import { mountJsonForms } from '../util';

describe('EnumControlRenderer.vue', () => {
  const renderers = [enumControlRendererEntry];

  const data = 'a';

  const schema = {
    type: 'string',
    title: 'My Enum',
    enum: ['a', 'b'],
  };
  const uischema = {
    type: 'Control',
    scope: '#',
    options: {
      placeholder: 'enum placeholder',
    },
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

  it('check if child EnumControlRenderer exists', () => {
    expect(wrapper.getComponent(EnumControlRenderer));
  });

  it('renders a readonly input', () => {
    expect(
      wrapper.find('input[readonly="readonly"][type="text"]').exists()
    ).toBe(true);
  });

  it('renders title as label', () => {
    expect(wrapper.find('label').text()).toEqual('My Enum');
  });

  it('emits a data change', async () => {
    const select = wrapper.find('input[type="hidden"]');
    await select.setValue('b');
    expect(wrapper.vm.$data.data).toEqual('b');
  });

  it('should have a placeholder', async () => {
    const input = wrapper.find('input[type="text"]');
    // select the input so the placeholder is generated
    await input.trigger('click');

    const placeholder = input.attributes('placeholder');
    expect(placeholder).toEqual('enum placeholder');
  });

  it('should render component and match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render component and match snapshot when clicked', async () => {
    const input = wrapper.find('input[type="text"]');
    await input.trigger('click');
    expect(wrapper.html()).toMatchSnapshot();
  });
});
