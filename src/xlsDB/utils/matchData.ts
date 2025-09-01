// Time complexity: O(n)
export const matchData = (
  dataRow: string[],
  positionValuesMap: {
    [key in number]: string;
  },
): boolean => {
  if (!dataRow || dataRow.length === 0) return false;
  // iterate over the positionValuesMap and check if the value at the position in dataRow matches the value in positionValuesMap
  // if any value does not match, return false
  // for example, if positionValuesMap is { 0: 'John', 1: 'Doe' } and dataRow is ['John', 'Doe'], return true
  // if positionValuesMap is { 0: 'John', 1: 'Smith' } and dataRow is ['John', 'Doe'], return false
  // if positionValuesMap is { 0: 'John', 1: 'Doe' } and dataRow is ['John', 'Doe', '30'], return true
  for (const [position, value] of Object.entries(positionValuesMap)) {
    if (JSON.parse(dataRow[position]) !== value) return false;
  }
  return true;
};
