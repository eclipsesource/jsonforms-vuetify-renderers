export const onChange = (event) => {
  let [data] = event.detail;
  console.log('Form state changed:' + JSON.stringify(data));
};
