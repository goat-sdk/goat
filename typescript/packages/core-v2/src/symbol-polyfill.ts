// @see https://github.com/microsoft/TypeScript/issues/53461#issuecomment-1606684134
(Symbol as { metadata: symbol }).metadata ??= Symbol("Symbol.metadata");
