export const createObjectfromArrays = (keys: string[], values: any[]) => {
  return keys.reduce((acc, key, index) => {
    console.log(values[index]);
    acc[key] = values[index] ? JSON.parse(values[index]) : '';
    return acc;
  }, {});
};
