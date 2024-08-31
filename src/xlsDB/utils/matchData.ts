// Time complexity: O(n)
export const matchData = (
  dataRow: string[],
  positionValuesMap: {
    [key in number]: string;
  },
): boolean => {
  for (const [position, value] of Object.entries(positionValuesMap)) {
    if (JSON.parse(dataRow[position]) !== value) return false;
  }
  return true;
};
