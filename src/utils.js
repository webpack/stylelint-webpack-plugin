import { join } from 'path';

import arrify from 'arrify';

export function parseFiles(files, context) {
  return arrify(files).map((file) =>
    replaceBackslashes(join(context, '/', file))
  );
}

export function replaceBackslashes(str) {
  return str.replace(/\\/g, '/');
}
