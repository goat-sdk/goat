// Currently empty; needs to be kept separate from parameters.ts else
// we end up with dependency resolution issues.

// Slightly convoluted way to make {} mean empty; remove this when we
// have some plugin parameters.
const emptySymbol = Symbol("EmptyObject_type");

export type ZilliqaPluginParams = { [emptySymbol]?: never };
