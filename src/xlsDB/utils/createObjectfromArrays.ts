export const createObjectfromArrays = (keys: string[], values: any[]) => {
  return keys.reduce((acc, key, index) => {
    acc[key] = values[index];
    return acc;
  }, {});
};
