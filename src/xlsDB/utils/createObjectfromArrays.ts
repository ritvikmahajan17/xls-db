export const createObjectfromArrays = (keys: string[], values: any[]) => {
  // iterate over the keys and values arrays and create an object with the keys as the keys and the values as the values
  // for example, if keys is ['name', 'age', 'city'] and values is ['John Doe', '30', 'New York'], return { name: 'John Doe', age: '30', city: 'New York' }
  // if keys is ['name', 'age', 'city'] and values is ['John Doe', '', 'New York'], return { name: 'John Doe', age: '', city: 'New York' }
  // if keys is ['name', 'age', 'city'] and values is ['John Doe', '30', ''], return { name: 'John Doe', age: '30', city: '' }
  // if keys is ['name', 'age', 'city'] and values is ['John Doe', '30', 'New York'], return { name: 'John Doe', age: '30', city: 'New York' }

  return keys.reduce((acc, key, index) => {
    acc[key] = values[index] ? JSON.parse(values[index]) : '';
    return acc;
  }, {});
};
