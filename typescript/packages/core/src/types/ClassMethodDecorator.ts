// biome-ignore lint/suspicious/noExplicitAny: any[] is the correct default type for any function arguments
export type ClassMethodDecorator = <This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) => (this: This, ...args: Args) => Return;
