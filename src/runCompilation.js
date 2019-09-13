import { lint } from 'stylelint';

export default function runCompilation(options, compiler, callback) {
  let errors = [];
  let warnings = [];

  const fileHasErrors = (file) => file.errored;
  const fileHasWarnings = (file) => file.warnings && file.warnings.length;

  lint(options)
    .then(({ results }) => {
      if (options.emitErrors === false) {
        warnings = results.filter(
          (file) => fileHasErrors(file) || fileHasWarnings(file)
        );
      } else {
        warnings = results.filter(
          (file) => !fileHasErrors(file) && fileHasWarnings(file)
        );
        errors = results.filter(fileHasErrors);
      }

      if (options.failOnError && errors.length) {
        callback(new Error('Failed because of a stylelint error.'));
      } else {
        callback();
      }
    })
    .catch(callback);

  compiler.hooks[options.emitErrors ? 'afterCompile' : 'afterEmit'].tapAsync(
    'StylelintWebpackPlugin',
    (compilation, next) => {
      if (warnings.length) {
        compilation.warnings.push(new Error(options.formatter(warnings)));
        warnings = [];
      }

      if (errors.length) {
        compilation.errors.push(new Error(options.formatter(errors)));
        errors = [];
      }

      next();
    }
  );
}
