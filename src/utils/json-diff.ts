/**
 * Fast Line & Property Diffing Algorithm
 */

export interface DiffLine {
  type: 'unchanged' | 'add' | 'remove';
  leftLineNumber?: number;
  rightLineNumber?: number;
  content: string;
}

export function computeJsonDiff(json1: string, json2: string): DiffLine[] {
  let text1 = json1;
  let text2 = json2;
  
  try {
    text1 = JSON.stringify(JSON.parse(json1), null, 2);
  } catch (e) {}
  try {
    text2 = JSON.stringify(JSON.parse(json2), null, 2);
  } catch (e) {}
  
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  const diffs: DiffLine[] = [];
  let i = 0;
  let j = 0;
  
  while (i < lines1.length || j < lines2.length) {
    if (i < lines1.length && j < lines2.length) {
      if (lines1[i] === lines2[j]) {
        diffs.push({
          type: 'unchanged',
          leftLineNumber: i + 1,
          rightLineNumber: j + 1,
          content: lines1[i]
        });
        i++;
        j++;
      } else {
        // Look ahead for match
        let foundMatchIn2 = lines2.indexOf(lines1[i], j);
        let foundMatchIn1 = lines1.indexOf(lines2[j], i);
        
        if (foundMatchIn2 !== -1 && (foundMatchIn1 === -1 || foundMatchIn2 - j <= foundMatchIn1 - i)) {
          while (j < foundMatchIn2) {
            diffs.push({
              type: 'add',
              rightLineNumber: j + 1,
              content: lines2[j]
            });
            j++;
          }
        } else if (foundMatchIn1 !== -1) {
          while (i < foundMatchIn1) {
            diffs.push({
              type: 'remove',
              leftLineNumber: i + 1,
              content: lines1[i]
            });
            i++;
          }
        } else {
          diffs.push({
            type: 'remove',
            leftLineNumber: i + 1,
            content: lines1[i]
          });
          diffs.push({
            type: 'add',
            rightLineNumber: j + 1,
            content: lines2[j]
          });
          i++;
          j++;
        }
      }
    } else if (i < lines1.length) {
      diffs.push({
        type: 'remove',
        leftLineNumber: i + 1,
        content: lines1[i]
      });
      i++;
    } else if (j < lines2.length) {
      diffs.push({
        type: 'add',
        rightLineNumber: j + 1,
        content: lines2[j]
      });
      j++;
    }
  }
  
  return diffs;
}
