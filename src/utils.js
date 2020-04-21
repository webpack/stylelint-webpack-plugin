import { join } from 'path';

import arrify from 'arrify';

const UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\())/g;

export function parseFiles(files, context) {
  return arrify(files).map((file) =>
    replaceBackslashes(context).replace(UNESCAPED_GLOB_SYMBOLS_RE, '\\$2') + '/' + replaceBackslashes(file)
  );
}

export function replaceBackslashes(str) {
  return str.replace(/\\/g, '/');
}
